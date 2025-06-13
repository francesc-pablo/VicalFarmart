import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBasket, Package, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Users", value: "150", icon: Users, color: "text-blue-500" },
    { title: "Active Sellers", value: "45", icon: ShoppingBasket, color: "text-primary" },
    { title: "Total Orders", value: "875", icon: Package, color: "text-orange-500" },
    { title: "Platform Revenue (Month)", value: "$12,300", icon: DollarSign, color: "text-green-500" },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Oversee platform activities and manage users." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground">+5 from last week</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent User Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent registrations to display yet.</p>
            {/* Placeholder for recent user registrations list */}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Order Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Order trends data will be shown here.</p>
            {/* Placeholder for order trends chart or list */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
