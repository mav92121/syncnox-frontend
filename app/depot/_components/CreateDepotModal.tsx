import { Modal } from "antd";
import DepotForm from "./DepotForm";
import { DepotPayload } from "@/apis/depots.api";
import { Depot } from "@/types/depots.type";

interface CreateDepotModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (values: DepotPayload) => Promise<boolean>;
  isLoading: boolean;
  existingDepots?: Depot[];
}

const CreateDepotModal = ({
  open,
  setOpen,
  onSubmit,
  isLoading,
  existingDepots = [],
}: CreateDepotModalProps) => {
  return (
    <Modal
      title="Create Depot"
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={700}
      centered
      destroyOnHidden
      styles={{ body: { overflow: "hidden", height: "550px" } }}
    >
      <DepotForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        onCancel={() => setOpen(false)}
        existingDepots={existingDepots}
      />
    </Modal>
  );
};

export default CreateDepotModal;
