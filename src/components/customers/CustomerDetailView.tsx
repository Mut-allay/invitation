import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { Customer } from '@/types/index';

interface CustomerDetailViewProps {
  customer: Customer;
  onEdit?: () => void;
}

const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ customer, onEdit }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full overflow-y-auto responsive-p space-y-6">
              {/* Customer Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={customer.name} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-responsive-2xl font-bold text-slate-900">{customer.name}</h2>
              <p className="text-responsive-sm text-slate-600">Customer ID: {customer.id}</p>
            </div>
          </div>
          {onEdit && (
            <Button onClick={onEdit} variant="outline" className="w-full sm:w-auto">
              Edit Customer
            </Button>
          )}
        </div>

      {/* Contact Information */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-responsive-sm font-medium text-slate-900">Phone</p>
                <p className="text-responsive-sm text-slate-600">{customer.phone}</p>
              </div>
            </div>
            {customer.email && (
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-responsive-sm font-medium text-slate-900">Email</p>
                  <p className="text-responsive-sm text-slate-600">{customer.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <MapPinIcon className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-responsive-sm font-medium text-slate-900">NRC</p>
                <p className="text-responsive-sm text-slate-600">{customer.nrc}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-responsive-sm font-medium text-slate-900">Member Since</p>
                <p className="text-responsive-sm text-slate-600">
                  {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString() : new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Owned */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Vehicles Owned</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.vehiclesOwned?.length > 0 ? (
            <div className="space-y-3">
              {customer.vehiclesOwned.map((vehicleId, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Vehicle #{vehicleId.slice(-6)}</p>
                    <p className="text-responsive-sm text-slate-600">ID: {vehicleId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-responsive-sm font-medium text-slate-900">Owned</p>
                    <p className="text-xs text-slate-500">Customer Vehicle</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No vehicles registered</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* This would be populated with actual repair/invoice history */}
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500">No recent activity</p>
              <p className="text-responsive-sm text-slate-400">Repair and invoice history will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="h-12">
              Schedule Repair
            </Button>
            <Button variant="outline" className="h-12">
              Create Invoice
            </Button>
            <Button variant="outline" className="h-12">
              Add Vehicle
            </Button>
            <Button variant="outline" className="h-12">
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetailView;
