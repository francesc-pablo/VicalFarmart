import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBasket, ClipboardList, DollarSign, Activity } from "lucide-react";

export default function SellerDashboardPage() {
  const stats = [
    { title: "Active Listings", value: "15", icon: ShoppingBasket, color: "text-primary" },
    { title: "Pending Orders", value: "3", icon: ClipboardList, color: "text-yellow-500" },
    { title: "Total Revenue (Month)", value: "$1,250", icon: DollarSign, color: "text-green-500" },
    { title: "Overall Rating", value: "4.8/5", icon: Activity, color: "text-blue-500" },
  ];

  return (
    <div>
      <PageHeader title="Seller Dashboard" description="Welcome back! Here's an overview of your store." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent orders to display yet.</p>
            {/* Placeholder for recent orders list */}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Product performance data will be shown here.</p>
            {/* Placeholder for product performance chart or list */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
