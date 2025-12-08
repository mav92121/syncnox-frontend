import JobForm from "@/components/Jobs/JobForm";
import { Modal } from "antd";

const AddJobsModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  return (
    <Modal
      footer={null}
      title="Add Job"
      open={open}
      onCancel={() => setOpen(false)}
      width={700}
      styles={{ body: { overflow: "hidden", height: "72vh" } }}
    >
      <div style={{ height: "100%" }}>
        <JobForm />
      </div>
    </Modal>
  );
};

export default AddJobsModal;
