
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Terms of Service"
        description="Please read our terms of service carefully."
        actions={
          <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Vical Farmart Terms of Service</CardTitle>
          <CardDescription>Last Updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 prose prose-sm sm:prose-base max-w-none">
          
          <h2 className="text-xl font-semibold">1.1 Interpretation</h2>
          <p>
            In these terms and conditions, the definitions and rules of interpretations set out, shall have the meaning set out therein and the rules of interpretation shall apply. Customer (refers to consumers/ buyers) and Suppliers (refers to subscriber) of VICAL FARMART platform which is the sole property of VICAL FARMS.
          </p>

          <h2 className="text-xl font-semibold">2.1 Basic contract</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              The Contract constitutes an offer by the VICAL FARMS to facilitate the sales of agriculture produce of members of the Ghana Co-operative Agricultural Producers and Marketing Association and other farmer based organization to Consumers in accordance with these Conditions.
            </li>
            <li>
              The Contract shall be deemed as accepted on the basis of:
              <ul className="list-[lower-alpha] pl-6 mt-2 space-y-1">
                <li>The Supplier issuing written acceptance of the Offer; or</li>
                <li>any act by the Supplier consistent with fulfilling the Offer, at which point and on which date the Contract shall come into existence (Commencement Date).</li>
              </ul>
            </li>
            <li>
              These Conditions apply to the Contract to the exclusion of any other terms that the Supplier seeks to impose or incorporate, or which are implied by trade, custom, practice or course of dealing.
            </li>
            <li>
              All of these Conditions shall apply to the supply of Goods/ Commodities and services except where the application to one or the other is specified.
            </li>
          </ol>

          <h2 className="text-xl font-semibold">3.1 Supply of Goods and Commodities</h2>
          <p>The Supplier shall ensure that the Goods/ Commodities:</p>
          <ul className="list-[lower-alpha] pl-6 space-y-2">
            <li>Correspond with their description and any applicable Goods/ Commodities Specification;</li>
            <li>Be of satisfactory quality and fit for any purpose held out by the Supplier or made known to the Customer, expressly or by implication, and in this respect, the Customer relies on the Supplier&apos;s skill and judgment;</li>
            <li>where they are manufactured or processed products, be free from defects in design, materials and workmanship and remain so after delivery;</li>
            <li>comply with all applicable statutory and regulatory requirements relating to the production, labeling, packaging, storage, handling and delivery of the Goods/ Commodities; and</li>
            <li>Comply with any specific requirements for the Goods/ Commodity set out in the Order.</li>
          </ul>
          <ol className="list-[upper-roman] pl-6 space-y-2">
              <li>The Supplier shall ensure that at all times, it has and maintains all the permissions, authorizations, consents and permits that it needs to carry out its obligations under the Contract in respect of the Goods/Commodities.</li>
              <li>The Customer may inspect the Goods/commodities at any time before delivery. The Supplier shall remain fully responsible for the Good/Commodities despite any such inspection or testing and shall not reduce or otherwise affect the Supplier&apos;s obligations under the Contract.</li>
          </ol>
          

          <h2 className="text-xl font-semibold">4.1 Delivery of Good/ Commodities</h2>
          <p>The Supplier shall ensure that:</p>
          <ol className="list-[upper-roman] pl-6 space-y-2">
            <li>The Goods/ Commodities are properly packed and secured in such manner as to enable them to reach their destination in good condition.</li>
            <li>Each delivery of the Goods/ Commodities is accompanied by a delivery note which show the date of the Order, the Order number(if any),the type and quantity of the Goods/ Commodities (including the code number of the Goods(where applicable), special storage instructions(if any),other information as the Customer may require and, if the Goods are being delivered by installments, the outstanding balance of Goods remaining to be delivered; and</li>
            <li>State clearly on the delivery note any requirement for the Customer to return any packaging material for the Goods/Commodities to the Supplier. Any such packaging material shall only be returned to the Supplier at the cost of the Supplier.</li>
          </ol>
          
          <p>The Supplier shall deliver the Goods/ Commodities:</p>
          <ol className="list-[upper-roman] pl-6 space-y-2">
            <li>On the date specified in the Order or, if no such date is specified, then within 30 days of the Commencement Date;</li>
            <li>to the Customer&apos;s trading address or such other location as is set out in the Order or as instructed by the Customer before delivery (Delivery Location); and</li>
            <li>during the Supplier&apos;s normal hours of business on a Business Day, or as instructed by the Customer.</li>
          </ol>
          
          <p>If the Supplier:</p>
          <ul className="list-[lower-alpha] pl-6 space-y-2">
            <li>delivers less than the quantity of Goods/ Commodities ordered, the Customer may reject the Goods/ Commodities; or</li>
            <li>delivers more than the quantity of Goods/Commodities ordered, the Customer may at its sole discretion reject the Goods/ Commodities or the excess Goods/ Commodities, and any rejected Goods shall be returnable at the Supplier&apos;s risk and expense. If the Supplier delivers more or less than the quantity of Goods ordered, and the Customer accepts the delivery, the Supplier shall make a pro rata adjustment to the invoice for the Goods/ Commodes.</li>
          </ul>

          <h3 className="text-lg font-semibold">Supply Service</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>The shipment of commodities shall be carried out by a courier service provider (third party agent) who shall lift commodities from the supplier and upon inspection, transport and deliver same to the customer who shall accept the commodity and sign the delivery note.</li>
            <li>The courier service provider shall ensure that the goods shall be in good and same condition as it is lifted from the supplier.</li>
            <li>Upon inspection of the commodity and lifting it from the supplier all liabilities will be transfer to the courier service provider until the goods are delivered to the customer.</li>
          </ul>

          <h2 className="text-xl font-semibold">5.1 Customer obligation</h2>
          <p>The customer shall:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide the Supplier with the necessary information to aid a successful delivery of their orders.</li>
            <li>Perform the obligations required to be performed as specified in the Order or otherwise agreed in writing by the Customer.</li>
          </ul>

          <h2 className="text-xl font-semibold">Charges and payment</h2>
          <p>The price for the Goods/Commodities:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Shall be the price set out in the Order, or otherwise agreed in writing by the Supplier at the Commencement Date; and</li>
            <li>Shall be inclusive of the costs of transportation. No extra charges shall be effective unless agreed in writing and signed by the Customer.</li>
          </ul>
          <ul className="list-[lower-alpha] pl-6 space-y-2">
            <li>The charges for the Services shall be set out in the Order and shall be the full and exclusive remuneration of the Supplier in respect of the performance of the Services.</li>
            <li>In respect of the Goods/Commodities, the Supplier shall invoice VICAL FARMS on or at any time after completion of delivery. Each invoice shall include such supporting information required by VICAL FARMS to verify the accuracy of the invoice, including but not limited to the relevant purchase order number.</li>
            <li>In consideration of the supply of Goods/ Commodities by the Supplier, VICAL FARMS shall pay the invoiced amounts within 7 days for retailer suppliers and 30 days for wholesales suppliers of receipt of a correctly rendered invoice to a bank account or any other mode of payment nominated in writing by the Supplier.</li>
            <li>The Supplier shall maintain complete and accurate records of the Goods/ Commodities supplied, the time of supply and the name of the representative of the dispatch service provider which shall be submitted to VICAL FARMS at the end of each month.</li>
            <li>The Supplier is obligated to pay a monthly subscription fee to VICAL FARMART by listing their Goods and commodities on the VICAL FARMART market platform as a service fee in order to carry out its obligation by facilitating the needed market linkages successfully.</li>
            <li>The first month of subscription by suppliers to our service (VICAL FARMART) market plat form is free and suppliers are obliged to pay for subsequence subscriptions.</li>
          </ul>

          <h2 className="text-xl font-semibold">6.1 Confidentiality</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
                Each party undertakes that it shall not at any time during the Contract and for a period of five years after termination of the Contract, disclose to any person information of the other party. Each party may disclose the other party&apos;s confidential information:
            </li>
            <li>To its employees, officers, representatives, subcontractors or advisers who need to know such information for the purposes of carrying out the party&apos;s obligations under the Contract. Each party shall ensure that its employees, officers representatives, Sub-contractors or advisers to whom it discloses the other party&apos;s Confidential information must comply with this clause 1 (confidentiality); and</li>
            <li>as may be required by law, a court of competent jurisdiction or any governmental or regulatory authority.</li>
            <li>Neither party shall use the other party&apos;s confidential information for any purpose other than to perform its obligations under the Contract.</li>
            <li>All materials, equipment, tools, copyright, rights in designs and any other Intellectual Property Rights in all drawings, specifications and data supplied by VICAL FARMS to the Supplier shall at all times be and remains the exclusive property of VICAL FARMS, but shall be held by the Supplier in safe custody at its own risk and maintained and kept in good condition by the Supplier until returned to VICAL FARMS, and shall not be disposed of or used other than in accordance with VICAL FARMS written instructions or authorization.</li>
          </ol>

          <h2 className="text-xl font-semibold">7.1 Termination</h2>
          <p>Without affecting any other right or remedy available to it, VICAL FARMS may terminate the Contract with immediate effect by giving written notice to the Supplier if:</p>
          <ol className="list-[lower-roman] pl-6 space-y-2">
            <li>There is a change of location of the Supplier without prior written notice to VICAL FARMS; or</li>
            <li>the Supplier&apos;s financial position deteriorates to such an extent that in the VICAL FARMS opinion the Supplier&apos;s capability to adequately fulfill its obligations under the Contract has been placed in jeopardy; or</li>
            <li>Without affecting any other right or remedy available to it, either party may terminate the Contract with immediate effect by giving written notice to the other party if:
              <ul className="list-[lower-alpha] pl-6 mt-2 space-y-1">
                <li>The other party commits a material breach of any term of the Contract which breach is irremediable or (if such breach is remediable) fails to remedy that breach within a period of 7 working days after being notified in writing to do so.</li>
                <li>the other party takes any step or action in connection with its entering administration, provisional liquidation or any composition or arrangement with its creditors (other than in relation to a solvent restructuring), being wound up (whether voluntarily or by order of the court unless for the purpose of a solvent regarding any offence or alleged offence of or in connection with slavery and human trafficking.</li>
                <li>VICAL FARMS shall have the right to terminate the Contract with immediate effect by giving written notice to the Supplier if the Supplier commits a breach of this clause 7.</li>
              </ul>
            </li>
          </ol>

        </CardContent>
      </Card>
    </div>
  );
}
