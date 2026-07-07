"use client";

import React, { useState } from "react";
import {
  User,
  Bell,
  Lock,
  CreditCard,
  Globe,
  Shield,
  Eye,
  ChevronRight,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      {/* Account Settings */}
      <Card className="shadow-md border border-muted-foreground/20">
        <CardHeader className="bg-linear-to-r from-primary/5 to-primary/5">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" />
            Account Information
          </CardTitle>
          <CardDescription>
            Manage your personal details and profile
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Link href="/user/profile" className="block group">
              <div className="flex items-center justify-between p-4 rounded-lg border border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Profile Settings
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Update name, avatar, and contact info
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <div className="flex items-center justify-between p-4 rounded-lg border border-muted-foreground/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Language & Region
                  </h4>
                  <p className="text-sm text-muted-foreground">English (US)</p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-md border border-muted-foreground/20">
        <CardHeader className="bg-linear-to-r from-primary/5 to-primary/5">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Security & Privacy
          </CardTitle>
          <CardDescription>
            Manage your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Link href="/user/profile" className="block group">
              <div className="flex items-center justify-between p-4 rounded-lg border border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Change Password
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <div className="flex items-center justify-between p-4 rounded-lg border border-muted-foreground/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Privacy Settings
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Control data visibility
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 border-green-200"
              >
                Secure
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="shadow-md border border-muted-foreground/20">
        <CardHeader className="bg-linear-to-r from-primary/5 to-primary/5">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Bell className="w-5 h-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="email-notifications"
                  className="text-base font-semibold text-foreground"
                >
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="push-notifications"
                  className="text-base font-semibold text-foreground"
                >
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="order-updates"
                  className="text-base font-semibold text-foreground"
                >
                  Order Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about order status
                </p>
              </div>
              <Switch
                id="order-updates"
                checked={orderUpdates}
                onCheckedChange={setOrderUpdates}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="promotions"
                  className="text-base font-semibold text-foreground"
                >
                  Promotions & Offers
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive special deals and discounts
                </p>
              </div>
              <Switch
                id="promotions"
                checked={promotions}
                onCheckedChange={setPromotions}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="shadow-md border border-muted-foreground/20">
        <CardHeader className="bg-linear-to-r from-primary/5 to-primary/5">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage your saved payment options</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No payment methods saved
            </p>
            <p className="text-sm text-muted-foreground">
              Payment methods will be added during checkout
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
