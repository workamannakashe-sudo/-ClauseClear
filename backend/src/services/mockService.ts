import {
  LeaseAnalysisResult,
  LeaseComparisonResult,
  GroundedQAResult,
  ActionChecklistResult,
  Clause
} from '../types/index.js';
import { evaluateLeaseRisk } from '../engine/riskEvaluator.js';
import { assessDocumentComplexity } from '../engine/toneComplexity.js';

export class MockService {
  /**
   * Deterministic mock analysis for residential leases
   */
  public static analyzeLease(text: string): LeaseAnalysisResult {
    const lower = text.toLowerCase();
    const isPredatory =
      lower.includes('apex slumlord') ||
      lower.includes('without prior notice') ||
      lower.includes('sole responsibility for all repairs') ||
      lower.includes('liquidated damages') && lower.includes('forfeited');

    const complexity = assessDocumentComplexity(text);

    if (isPredatory) {
      const predatoryClauses: Clause[] = [
        {
          id: 'c1',
          title: 'Unrestricted Landlord Entry at Any Hour',
          category: 'unusual_clause',
          originalSnippet:
            'Landlord and contractor personnel retain full, unrestricted right to enter the unit at any hour of the day or night without prior notice...',
          plainEnglish:
            'The landlord claims they can unlock and enter your apartment at 3:00 AM without giving you any heads-up, and can evict you in 24 hours if you object.',
          whyItMatters:
            'Violates your fundamental right to quiet enjoyment and privacy. Standard state laws require at least 24 to 48 hours advance notice before non-emergency entry.',
          riskLevel: 'CRITICAL',
          isUnusual: true,
          recommendation:
            'DO NOT SIGN with this clause. Insist on standard statutory language: "Minimum 24 hours written notice for non-emergency access between 9 AM and 6 PM."'
        },
        {
          id: 'c2',
          title: 'Waiver of Implied Warranty of Habitability',
          category: 'risk_flag',
          originalSnippet:
            'Tenant explicitly accepts the unit strictly "AS-IS" and agrees to waive all statutory warranties of habitability. Tenant assumes sole financial and physical responsibility for all repairs...',
          plainEnglish:
            'You are forced to pay for broken roofs, leaking sewage, furnace failure, and extermination even if the damage existed before you moved in.',
          whyItMatters:
            'In nearly every state, the warranty of habitability is non-waivable by law. A landlord cannot legally dump major structural and plumbing duties onto a tenant.',
          riskLevel: 'CRITICAL',
          isUnusual: true,
          recommendation:
            'Demand full removal of this clause. Landlords must legally remain responsible for structural, plumbing, heating, and habitability repairs.'
        },
        {
          id: 'c3',
          title: 'Immediate 100% Security Deposit Forfeiture & Checkout Fees',
          category: 'risk_flag',
          originalSnippet:
            'In the event Tenant vacates before 24 months, the entire security deposit shall be unconditionally forfeited as liquidated damages. Furthermore, Landlord reserves sixty (60) days after move-out...',
          plainEnglish:
            'The landlord keeps your entire $6,600 deposit automatically if you leave before 2 years, plus arbitrarily deducts an extra $1,300 in mandatory cleanup fees.',
          whyItMatters:
            'Security deposits are your property held in trust. They may only cover unpaid rent or actual documented damage exceeding normal wear-and-tear.',
          riskLevel: 'CRITICAL',
          isUnusual: true,
          recommendation:
            'Request deletion of automatic forfeiture and cap deposit return timeline to the local statutory limit (typically 14 to 30 days).'
        },
        {
          id: 'c4',
          title: 'Zero Grace Period & Usurious Late Fees',
          category: 'tenant_obligation',
          originalSnippet:
            'There is zero grace period. If payment is 1 minute late, Tenant shall incur an immediate $250.00 penalty plus $50.00 per day until paid in full.',
          plainEnglish:
            'If your rent arrives at 9:01 AM on the 1st, you are fined $250 plus $50/day. Over 5 days late, that is $500 in fees.',
          whyItMatters:
            'Excessive late fees are often classified as illegal penalties rather than reasonable compensation for late processing.',
          riskLevel: 'HIGH',
          isUnusual: true,
          recommendation:
            'Negotiate a standard 5-day grace period and cap the late fee at $50 or 5% of monthly rent.'
        },
        {
          id: 'c5',
          title: 'Waiver of Jury Trial & Landlord-Biased Arbitration',
          category: 'risk_flag',
          originalSnippet:
            'Tenant unconditionally waives any right to a trial by jury and agrees to binding arbitration with an arbitrator chosen solely by Landlord, with all fees borne by Tenant.',
          plainEnglish:
            'You give up your right to sue the landlord in court or present your case to a jury, and you must pay for an arbitrator chosen by the landlord.',
          whyItMatters:
            'Severely impairs your ability to seek justice or compensation if the landlord harms you or breaches the lease.',
          riskLevel: 'HIGH',
          isUnusual: true,
          recommendation:
            'Consult tenant legal aid before agreeing to unilateral arbitration clauses.'
        }
      ];

      const riskProfile = evaluateLeaseRisk(predatoryClauses);

      return {
        summary: {
          headline:
            'EXTREME PREDATORY LEASE: Contains severe red-flag clauses that violate standard tenant protections and habitability laws.',
          keyDetails: {
            rentAmount: '$2,200.00 / month',
            securityDeposit: '$6,600.00 (3 months rent)',
            leaseTerm: '24 Months Mandatory',
            lateFee: '$250 + $50/day (Zero grace period)',
            noticePeriodDays: 0
          },
          overallRiskScore: riskProfile.overallRiskScore,
          riskLevel: 'CRITICAL',
          criticalNotice: riskProfile.advisorySummary,
          complexityLevel: complexity.complexityLevel
        },
        clauses: predatoryClauses,
        isMockMode: true
      };
    }

    // Default / Standard Balanced Lease
    const standardClauses: Clause[] = [
      {
        id: 'c1',
        title: '24-Hour Landlord Notice of Entry',
        category: 'landlord_obligation',
        originalSnippet:
          'Landlord and authorized agents shall have the right to enter the premises... upon providing at least twenty-four (24) hours advance written or electronic notice.',
        plainEnglish:
          'The landlord must notify you at least 24 hours in advance before entering for maintenance or inspections, except in true emergencies.',
        whyItMatters:
          'Protects your domestic privacy and quiet enjoyment in accordance with standard residential landlord-tenant regulations.',
        riskLevel: 'STANDARD',
        isUnusual: false,
        recommendation:
          'Standard fair clause. Keep records of notice dates if landlord visits occur.'
      },
      {
        id: 'c2',
        title: 'Landlord Maintenance & Housing Code Warranties',
        category: 'landlord_obligation',
        originalSnippet:
          'Landlord shall be responsible for maintaining structural elements, exterior walls, roof, electrical systems, plumbing, and heating systems in good operating condition...',
        plainEnglish:
          'The landlord is bound to fix roof leaks, heaters, plumbing, and structural components.',
        whyItMatters:
          'Complies with the Implied Warranty of Habitability. Ensures you are not financially responsible for capital building repairs.',
        riskLevel: 'STANDARD',
        isUnusual: false,
        recommendation:
          'Favorable term. Always submit repair requests in writing with dated photos.'
      },
      {
        id: 'c3',
        title: 'Security Deposit Held in Escrow & 30-Day Return',
        category: 'landlord_obligation',
        originalSnippet:
          'Tenant shall deposit $1,800.00 held in an interest-bearing escrow account. The deposit will be returned within thirty (30) days following move-out...',
        plainEnglish:
          'Your 1-month deposit is protected in a separate escrow account and must be returned with itemized receipts within 30 days of moving out.',
        whyItMatters:
          'Complies with statutory security deposit requirements. Prevents landlords from commingling your deposit funds.',
        riskLevel: 'STANDARD',
        isUnusual: false,
        recommendation:
          'Request a move-in inspection walk-through sheet signed by both parties.'
      },
      {
        id: 'c4',
        title: 'Five-Day Rent Grace Period & $50 Late Charge',
        category: 'tenant_obligation',
        originalSnippet:
          'A grace period of five (5) calendar days is permitted. If rent is received after 11:59 PM on the 5th day, a late fee of $50.00 shall be assessed.',
        plainEnglish:
          'Rent is due on the 1st, but you have until the 5th before a reasonable $50 late charge applies.',
        whyItMatters:
          'Standard commercial grace period providing reasonable buffer for bank holidays and payroll schedules.',
        riskLevel: 'STANDARD',
        isUnusual: false,
        recommendation:
          'Set up automated bank transfers 2-3 days before the 1st to ensure timely arrival.'
      },
      {
        id: 'c5',
        title: 'Landlord Consent Required for Subletting',
        category: 'tenant_obligation',
        originalSnippet:
          'Tenant shall not assign this Lease or sublet any portion of the premises without obtaining Landlord prior written consent, which shall not be unreasonably withheld or delayed.',
        plainEnglish:
          'You cannot sublease to roommates or Airbnb guests without written landlord approval, but the landlord cannot arbitrarily refuse reasonable applicants.',
        whyItMatters:
          'The "shall not be unreasonably withheld" phrase protects you from arbitrary rejections if you need to relocate.',
        riskLevel: 'MEDIUM',
        isUnusual: false,
        recommendation:
          'If you plan to have a subtenant, verify their credit score and rental history in advance.'
      }
    ];

    const riskProfile = evaluateLeaseRisk(standardClauses);

    return {
      summary: {
        headline:
          'BALANCED LEASE: Customary residential lease agreement with clear landlord obligations and standard tenant safeguards.',
        keyDetails: {
          rentAmount: '$1,800.00 / month',
          securityDeposit: '$1,800.00 (1 month rent)',
          leaseTerm: '12 Months (July 1, 2025 - June 30, 2026)',
          lateFee: '$50.00 after 5-day grace period',
          noticePeriodDays: 60
        },
        overallRiskScore: 18,
        riskLevel: 'LOW',
        criticalNotice: riskProfile.advisorySummary,
        complexityLevel: complexity.complexityLevel
      },
      clauses: standardClauses,
      isMockMode: true
    };
  }

  /**
   * Deterministic substantive comparison between two lease versions
   */
  public static compareLeases(versionA: string, versionB: string): LeaseComparisonResult {
    return {
      summary: {
        headline:
          'The renewal lease introduces a 13.9% rent hike, adds new recurring monthly fees, shortens your grace period, and shifts HVAC servicing costs onto you.',
        favourabilityShift: 'MORE_RESTRICTIVE_ON_TENANT',
        keyFinancialChanges: [
          {
            metric: 'Monthly Base Rent',
            before: '$1,800.00',
            after: '$2,050.00',
            percentChange: '+13.9%'
          },
          {
            metric: 'Mandatory Monthly Amenity & Trash Fee',
            before: '$0.00 (Included in rent)',
            after: '$85.00 / month',
            percentChange: 'NEW FEE'
          },
          {
            metric: 'Late Payment Fee',
            before: '$50.00 (after 5-day grace period)',
            after: '$125.00 (after 3-day grace period)',
            percentChange: '+150% increase'
          },
          {
            metric: 'Monthly Pet Fee',
            before: '$25.00 / month',
            after: '$50.00 / month',
            percentChange: '+100% increase'
          }
        ]
      },
      differences: [
        {
          clauseTitle: 'Grace Period Shortened & Late Penalty More Than Doubled',
          changeType: 'MODIFIED',
          impactOnTenant: 'NEGATIVE',
          severity: 'HIGH',
          versionA_Snippet:
            'A grace period of five (5) calendar days is permitted. Late fee of $50.00 shall be assessed.',
          versionB_Snippet:
            'Grace period is reduced to three (3) days. Late fee is increased to $125.00.',
          plainLanguageAnalysis:
            'You have 2 fewer days to submit rent before being charged $125 (up from $50). If a bank holiday falls on the 1st or 2nd, you risk unexpected penalty charges.',
          actionRecommendation:
            'Negotiate to restore the 5-day grace period and maintain the $50 fee, or request a compromise of $75.'
        },
        {
          clauseTitle: 'New Mandatory HVAC Servicing & Filter Obligation',
          changeType: 'ADDED',
          impactOnTenant: 'NEGATIVE',
          severity: 'HIGH',
          versionA_Snippet: null,
          versionB_Snippet:
            'Tenant is now required to arrange and pay for semi-annual HVAC filter replacements and servicing by a licensed HVAC technician...',
          plainLanguageAnalysis:
            'Landlord is shifting mechanical equipment maintenance costs to the tenant. Hiring a licensed technician twice a year typically costs $200–$400 annually.',
          actionRecommendation:
            'Object to paying for professional technician servicing; offer to replace basic furnace air filters if landlord provides the filters.'
        },
        {
          clauseTitle: 'Non-Renewal Notice Window Escalation & 150% Rent Penalty',
          changeType: 'MODIFIED',
          impactOnTenant: 'NEGATIVE',
          severity: 'HIGH',
          versionA_Snippet: '...providing at least sixty (60) days written notice...',
          versionB_Snippet:
            'Tenant must provide ninety (90) days notice... failure will automatically convert to month-to-month at 150% of base rent ($3,075.00/mo).',
          plainLanguageAnalysis:
            'You must decide whether to move 3 full months in advance. If you miss this early window, your monthly rent spikes to $3,075/month.',
          actionRecommendation:
            'Counter with 60 days notice and a standard market month-to-month surcharge of 10-15% rather than a punitive 50% surge.'
        },
        {
          clauseTitle: 'New Unbundled "Amenities & Trash" Fee Added',
          changeType: 'ADDED',
          impactOnTenant: 'NEGATIVE',
          severity: 'MEDIUM',
          versionA_Snippet: null,
          versionB_Snippet:
            'Tenant shall pay a new mandatory monthly "Community Amenities & Trash Fee" of $85.00...',
          plainLanguageAnalysis:
            'Disguised rent increase totaling $1,020 annually for services that were previously covered under base rent.',
          actionRecommendation:
            'Request that the $85 fee either be credited against the base rent increase or waived as a loyal renewing tenant.'
        }
      ],
      isMockMode: true
    };
  }

  /**
   * Deterministic grounded Q&A answering
   */
  public static answerQuestion(text: string, question: string): GroundedQAResult {
    const qLower = question.toLowerCase();
    const docLower = text.toLowerCase();

    // Check for Security Deposit
    if (qLower.includes('deposit') || qLower.includes('security')) {
      if (docLower.includes('deposit')) {
        const quoteMatch = text.match(/(?:security\s+deposit|refundable\s+deposit)[^.\n]+(?:\.|\n|$)/i);
        const quote = quoteMatch ? quoteMatch[0].trim() : 'The security deposit of ₹70,000 shall be refunded within seven (7) banking days.';
        return {
          isAddressedInDocument: true,
          answer: `The document specifies the security deposit terms: "${quote}".`,
          directQuote: quote,
          relevantSection: 'Security Deposit Clause',
          confidence: 'HIGH',
          recommendedFollowUp: 'Verify that the return conditions and deduction terms match local regulations.',
          isMockMode: true
        };
      }
    }

    // Check for Rent
    if (qLower.includes('rent') || qLower.includes('license fee') || qLower.includes('monthly payment')) {
      if (docLower.includes('rent') || docLower.includes('license fee')) {
        const quoteMatch = text.match(/(?:rent|license fee)[^.\n]+(?:\.|\n|$)/i);
        const quote = quoteMatch ? quoteMatch[0].trim() : 'The monthly license fee is ₹35,000.';
        return {
          isAddressedInDocument: true,
          answer: `The document specifies the rental terms: "${quote}".`,
          directQuote: quote,
          relevantSection: 'Monthly Rent / License Fee',
          confidence: 'HIGH',
          recommendedFollowUp: 'Ensure payment method and due date are convenient for your banking cycle.',
          isMockMode: true
        };
      }
    }

    // Check for Pet Policy
    if (qLower.includes('pet') || qLower.includes('dog') || qLower.includes('cat')) {
      if (docLower.includes('pet')) {
        return {
          isAddressedInDocument: true,
          answer:
            'Yes, pets are addressed in the lease. One domestic cat or dog under 35 lbs is permitted upon payment of a refundable $250 deposit and a monthly pet fee.',
          directQuote:
            'One domestic cat or dog under 35 lbs is permitted upon payment of a refundable pet deposit of $250.00 and an additional monthly pet fee...',
          relevantSection: 'Section 8: Pet Policy',
          confidence: 'HIGH',
          recommendedFollowUp:
            'Obtain written pet approval and confirm vaccination records are on file with building management.',
          isMockMode: true
        };
      }
    }

    // Check for Landlord Entry Notice
    if (
      qLower.includes('enter') ||
      qLower.includes('notice') ||
      qLower.includes('come in') ||
      qLower.includes('inspection')
    ) {
      if (docLower.includes('without prior notice')) {
        return {
          isAddressedInDocument: true,
          answer:
            'CRITICAL RISK: The lease claims the landlord can enter at any hour without prior notice. However, this is likely illegal under state tenant privacy statutes requiring 24 to 48 hours notice.',
          directQuote:
            'Landlord and contractor personnel retain full, unrestricted right to enter the unit at any hour of the day or night without prior notice...',
          relevantSection: 'Section 4: Unrestricted Landlord Entry',
          confidence: 'HIGH',
          recommendedFollowUp:
            'Do not accept this term. Cite local landlord entry statutes and request 24-hour advance written notice.',
          isMockMode: true
        };
      } else if (docLower.includes('twenty-four') || docLower.includes('24')) {
        return {
          isAddressedInDocument: true,
          answer:
            'The landlord must provide at least twenty-four (24) hours advance written or electronic notice before entering for inspections or maintenance, except in emergencies.',
          directQuote:
            'Landlord and authorized agents shall have the right to enter the premises... upon providing at least twenty-four (24) hours advance written or electronic notice.',
          relevantSection: 'Section 5: Landlord Entry & Notice',
          confidence: 'HIGH',
          recommendedFollowUp:
            'Ensure landlord uses your preferred email or phone number for entry notifications.',
          isMockMode: true
        };
      }
    }

    // Check for Subletting
    if (qLower.includes('sublet') || qLower.includes('airbnb') || qLower.includes('sublease')) {
      if (docLower.includes('sublet')) {
        return {
          isAddressedInDocument: true,
          answer:
            'Subletting is permitted only with the landlord prior written consent, which the agreement specifies "shall not be unreasonably withheld or delayed."',
          directQuote:
            'Tenant shall not assign this Lease or sublet any portion of the premises without obtaining Landlord prior written consent, which shall not be unreasonably withheld or delayed.',
          relevantSection: 'Section 7: Subletting & Assignment',
          confidence: 'HIGH',
          recommendedFollowUp:
            'Submit prospective subtenant applications in writing at least 30 days before their intended move-in.',
          isMockMode: true
        };
      }
    }

    // Unaddressed question refusal
    return {
      isAddressedInDocument: false,
      answer: `The provided lease agreement does NOT address or mention "${question}". There are no clauses or provisions in this document governing this topic.`,
      directQuote: null,
      relevantSection: 'N/A — Document is Silent',
      confidence: 'UNADDRESSED',
      recommendedFollowUp:
        'Because this contract is silent on this topic, state or municipal landlord-tenant statutes govern. You should request written clarification or an explicit addendum from the landlord if this is important to your tenancy.',
      isMockMode: true
    };
  }

  /**
   * Deterministic checklist and drafted letter generator
   */
  public static generateChecklist(analysis: LeaseAnalysisResult): ActionChecklistResult {
    const isCritical = analysis.summary.riskLevel === 'CRITICAL';

    return {
      summary: isCritical
        ? 'High-priority action plan: Essential legal objections, habitability protections, and landlord negotiation points before signing.'
        : 'Recommended move-in and lease verification checklist for a smooth tenancy.',
      checklist: isCritical
        ? [
            {
              id: 'act-1',
              category: 'legal_review',
              urgency: 'CRITICAL',
              title: 'Seek Local Tenant Union or Legal Aid Review on Habitability Waiver',
              actionDetails:
                'Section 5 forces you to pay for pre-existing structural issues and waives the warranty of habitability. Contact your local legal aid clinic immediately.',
              relatedClause: 'Waiver of Implied Warranty of Habitability'
            },
            {
              id: 'act-2',
              category: 'negotiate',
              urgency: 'CRITICAL',
              title: 'Demand Written 24-Hour Notice of Entry Amendment',
              actionDetails:
                'Do not sign a lease permitting unannounced 24/7 landlord entry. Request an amendment guaranteeing 24-hour advance written notice.',
              relatedClause: 'Unrestricted Landlord Entry'
            },
            {
              id: 'act-3',
              category: 'negotiate',
              urgency: 'HIGH',
              title: 'Strike Out 100% Security Deposit Forfeiture Clause',
              actionDetails:
                'Security deposits cannot be treated as penalty windfalls. Insist on standard statutory language capping deductions strictly to actual damage beyond normal wear.',
              relatedClause: 'Security Deposit Forfeiture'
            },
            {
              id: 'act-4',
              category: 'document',
              urgency: 'HIGH',
              title: 'Complete Timestamped Move-In Condition Video & Checklist',
              actionDetails:
                'Photograph and video every room, outlet, appliance, and water fixture on move-in day before unpacking to protect your deposit.',
              relatedClause: 'Move-in Condition'
            }
          ]
        : [
            {
              id: 'act-1',
              category: 'document',
              urgency: 'MEDIUM',
              title: 'Conduct Joint Move-In Inspection Walkthrough',
              actionDetails:
                'Walk through the property with the landlord or building manager, document all existing scuffs or minor flaws, and have both parties sign the checklist.',
              relatedClause: 'Security Deposit & Escrow'
            },
            {
              id: 'act-2',
              category: 'immediate',
              urgency: 'MEDIUM',
              title: 'Confirm Escrow Account Bank Details for Security Deposit',
              actionDetails:
                'Request written receipt confirming which financial institution holds your security deposit escrow account.',
              relatedClause: 'Section 4: Security Deposit'
            },
            {
              id: 'act-3',
              category: 'immediate',
              urgency: 'LOW',
              title: 'Set Rent Auto-Pay for the 1st of the Month',
              actionDetails:
                'Schedule automated ACH transfers 2-3 business days in advance to ensure rent is received prior to the expiration of the 5-day grace period.',
              relatedClause: 'Rent & Grace Period'
            }
          ],
      questionsForLandlord: isCritical
        ? [
            {
              question:
                'Will you amend Section 4 to mandate 24 hours advance notice before landlord or maintenance entry, in accordance with state tenant privacy laws?',
              context: 'Protects quiet enjoyment and privacy.'
            },
            {
              question:
                'Can you remove the habitability waiver in Section 5, as landlords have a non-waivable statutory duty to maintain plumbing, heating, and structural elements?',
              context: 'Shields tenant from thousands in building repair bills.'
            },
            {
              question:
                'What is the legal justification for unconditional forfeiture of the full $6,600 deposit if a lease is terminated early, rather than mitigating damages by re-renting?',
              context: 'Prevents unlawful liquidated damages penalties.'
            }
          ]
        : [
            {
              question:
                'What is the exact process and contact portal for submitting non-emergency maintenance requests?',
              context: 'Clarifies work-order workflow.'
            },
            {
              question:
                'Are utility meters individually metered for Unit 3B, or is water/trash billed via a RUBS ratio utility billing system?',
              context: 'Avoids surprise shared utility bills.'
            }
          ],
      questionsForLawyer: isCritical
        ? [
            {
              question: 'Is the clause waiving notice of entry enforceable under local municipal rent control / Model Tenancy Act rules?',
              context: 'To confirm whether such forfeiture or entry clauses are void as contrary to public policy.'
            },
            {
              question: 'Does the unilateral deposit forfeiture clause exceed the maximum allowable damages under Section 73/74 of the Indian Contract Act?',
              context: 'Penalty clauses in standard contracts can be challenged as unconscionable.'
            },
            {
              question: 'What is the required registration and stamp duty process for this leave and license agreement in Maharashtra/Karnataka/Delhi?',
              context: 'Unregistered agreements beyond 11 months cannot be produced as evidence in court.'
            }
          ]
        : [
            {
              question: 'Is this 11-month Leave & License agreement mandatory to be registered on the state e-registration portal?',
              context: 'Ensures the agreement has legal validity if a dispute arises.'
            },
            {
              question: 'What are the tenant rights regarding the return timeline of security deposit upon handover?',
              context: 'Clarifies legal recourse if landlord withholds deposit beyond agreed timeline.'
            }
          ],
      preSignVerification: [
        'Verify original title deeds / electricity bill in landlord name matching the agreement',
        'Verify that previous tenant electricity and water utility arrears are fully cleared',
        'Inspect all electrical sockets, plumbing fixtures, and geysers during daytime walkthrough',
        'Record high-resolution walkthrough video of all existing wall scuffs, tiles, and fittings',
        'Ensure stamp duty and registration fees are clearly accounted for with an official receipt',
        'Obtain signed inventory annexure listing all furniture and appliances provided'
      ],
      draftNegotiationLetter: {
        subject: isCritical
          ? 'Proposed Revisions to Residential Lease Agreement — Unit 12B'
          : 'Move-in Confirmation & Clarifications — Apt 3B',
        recipient: 'Property Management / Landlord',
        body: isCritical
          ? `Dear Property Management,\n\nThank you for providing the lease agreement for Unit 12B. I am very interested in this property and look forward to being a conscientious tenant.\n\nUpon reviewing the agreement, I noticed several clauses that diverge significantly from standard residential tenancy protections and statutory housing requirements. Specifically:\n\n1. Section 4 (Entry Notice): I request updating this clause to specify that Landlord will provide at least twenty-four (24) hours advance written notice prior to entering the premises, except in bona fide emergencies.\n\n2. Section 5 (Habitability & Maintenance): Please restore standard landlord statutory obligations to maintain major structural, plumbing, heating, and electrical systems in working order.\n\n3. Section 3 (Security Deposit): Please adjust the deposit forfeiture language so that deposit deductions are governed strictly by actual itemized repair costs for damages exceeding ordinary wear and tear, in accordance with state security deposit laws.\n\nI am eager to execute the lease once these standard adjustments are reflected in an updated agreement.\n\nSincerely,\n[Your Name]\n[Your Phone Number]`
          : `Dear Landlord,\n\nThank you for sending over the lease agreement for Apt 3B. I am excited to finalize our tenancy.\n\nBefore executing, I would appreciate confirmation on two quick operational details:\n1. What is your preferred contact method and portal for maintenance notifications?\n2. Can we schedule a 15-minute walkthrough on move-in day to co-sign the move-in condition checklist?\n\nThank you for your assistance, and I look forward to moving in.\n\nBest regards,\n[Your Name]`
      },
      isMockMode: true
    };
  }
}
