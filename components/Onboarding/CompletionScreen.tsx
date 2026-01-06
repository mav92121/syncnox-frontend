"use client";
import { Button, Card, Modal, Typography } from "antd";
import { CheckCircle, Truck, User } from "lucide-react";
import { useVehicleStore } from "@/store/vehicle.store";
import { useTeamStore } from "@/store/team.store";

const { Title, Text } = Typography;

interface CompletionScreenProps {
  onClose: () => void;
}

const CompletionScreen = ({ onClose }: CompletionScreenProps) => {
  const { vehicles } = useVehicleStore();
  const { teams } = useTeamStore();

  return (
    <Modal
      open={true}
      centered
      onCancel={onClose}
      footer={null}
      styles={{
        body: {
          padding: 0,
          height: "500px",
          overflow: "hidden",
        },
      }}
    >
      <div className="h-full p-12 flex flex-col items-center justify-center text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#003220] flex items-center justify-center mb-6">
          <CheckCircle size={40} color="white" />
        </div>

        {/* Title */}
        <Title level={2} className="m-0! mb-2!">
          You&apos;re all set
        </Title>

        {/* Description */}
        <Text className="text-base text-gray-500 mb-8">
          Your workspace is ready. Start optimizing routes and saving time.
        </Text>

        {/* Stats */}
        <div className="flex gap-12 mb-12">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <User size={20} className="text-blue-500" />
              <Title level={2} className="m-0!">
                {teams.length}
              </Title>
            </div>
            <Text type="secondary">Drivers</Text>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Truck size={20} className="text-blue-500" />
              <Title level={2} className="m-0!">
                {vehicles.length}
              </Title>
            </div>
            <Text type="secondary">Vehicles</Text>
          </div>
        </div>

        {/* Close Button */}
        <Button
          type="primary"
          size="large"
          onClick={onClose}
          className="h-12 px-12 text-base"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default CompletionScreen;
