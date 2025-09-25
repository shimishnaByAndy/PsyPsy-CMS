import React from 'react'
import { Button, Card, CardHeader, CardBody, CardFooter, Input, Chip, Badge, Avatar } from '@/components/ui/nextui'

/**
 * Test component to verify NextUI integration and tree-shaking
 * This component demonstrates various NextUI components with healthcare theme
 */
export function TestNextUI() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-primary">NextUI Healthcare Theme Test</h1>

      {/* Button variants */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <Button color="primary" variant="solid">
            Primary Action
          </Button>
          <Button color="success" variant="bordered">
            Success
          </Button>
          <Button color="warning" variant="light">
            Warning
          </Button>
          <Button color="danger" variant="ghost">
            Critical
          </Button>
          <Button color="secondary" variant="flat">
            PHI Data
          </Button>
        </div>
      </div>

      {/* Healthcare Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Healthcare Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="max-w-[400px]">
            <CardHeader className="flex gap-3">
              <Avatar
                name="Dr. Sarah Chen"
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
                size="md"
              />
              <div className="flex flex-col">
                <p className="text-md font-semibold">Dr. Sarah Chen</p>
                <p className="text-small text-gray-600">Clinical Psychologist</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm">
                Specializing in trauma therapy and PTSD treatment.
                Currently accepting new patients.
              </p>
              <div className="flex gap-2 mt-3">
                <Chip color="success" size="sm" variant="flat">
                  Available
                </Chip>
                <Chip color="primary" size="sm" variant="flat">
                  Trauma Specialist
                </Chip>
              </div>
            </CardBody>
            <CardFooter>
              <Button color="primary" size="sm" variant="solid">
                Book Appointment
              </Button>
            </CardFooter>
          </Card>

          <Card className="max-w-[400px]">
            <CardHeader className="flex gap-3">
              <Avatar
                name="Jean Martin"
                showFallback
                size="md"
                color="secondary"
              />
              <div className="flex flex-col">
                <p className="text-md font-semibold">Jean Martin</p>
                <p className="text-small text-gray-600">Patient ID: PAT-001</p>
              </div>
              <Badge color="warning" variant="flat" content="PHI">
                <div className="w-6 h-6" />
              </Badge>
            </CardHeader>
            <CardBody>
              <p className="text-sm">
                Next appointment: Jan 21, 2025 at 9:00 AM
              </p>
              <div className="flex gap-2 mt-3">
                <Chip color="primary" size="sm" variant="bordered">
                  Anxiety Treatment
                </Chip>
                <Chip color="success" size="sm" variant="dot">
                  Active Case
                </Chip>
              </div>
            </CardBody>
            <CardFooter>
              <Button color="secondary" size="sm" variant="light">
                View Records
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Form Inputs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Healthcare Forms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <Input
            type="text"
            label="Patient Name"
            placeholder="Enter patient full name"
            color="primary"
            variant="bordered"
          />
          <Input
            type="email"
            label="Professional Email"
            placeholder="doctor@clinic.com"
            color="primary"
            variant="bordered"
          />
          <Input
            type="date"
            label="Appointment Date"
            color="primary"
            variant="bordered"
          />
          <Input
            type="text"
            label="Medical Record Number"
            placeholder="MRN-12345"
            color="secondary"
            variant="bordered"
            startContent={
              <Badge color="warning" variant="flat" size="sm">
                PHI
              </Badge>
            }
          />
        </div>
      </div>

      {/* Status Indicators */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Status Indicators</h2>
        <div className="flex gap-4 flex-wrap">
          <Chip color="success" variant="solid">
            Appointment Confirmed
          </Chip>
          <Chip color="warning" variant="solid">
            Consent Required
          </Chip>
          <Chip color="danger" variant="solid">
            Critical Alert
          </Chip>
          <Chip color="primary" variant="solid">
            HIPAA Compliant
          </Chip>
          <Chip color="secondary" variant="bordered">
            Law 25 Verified
          </Chip>
        </div>
      </div>
    </div>
  )
}