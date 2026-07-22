import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const SectionCard = ({ title, description, action, children, className }) => {
  return (
    <Card className={className}>
      {(title || description || action) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};
