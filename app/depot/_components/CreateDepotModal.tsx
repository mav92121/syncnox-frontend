import { Modal } from "antd";
import DepotForm from "./DepotForm";
import { DepotPayload } from "@/apis/depots.api";

interface CreateDepotModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (values: DepotPayload) => Promise<boolean>;
  isLoading: boolean;
}

const CreateDepotModal = ({
  open,
  setOpen,
  onSubmit,
  isLoading,
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
      />
    </Modal>
  );
};

export default CreateDepotModal;
