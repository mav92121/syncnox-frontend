import { useState } from "react";
import BaseTable from "@/components/Table/BaseTable";
import { Team } from "@/types/team.type";
import { useTeamStore } from "@/zustand/team.store";
import { ColDef } from "ag-grid-community";
import { Typography, Drawer, Flex, Button } from "antd";
import { createActionsColumn } from "@/components/Table/ActionsColumn";
import TeamMemberForm from "./TeamMemberForm";
import AddTeamMemberModal from "./AddTeamMemberModal";
import dayjs from "dayjs";
import StatusBadge from "@/components/Jobs/StatusBanner";
import { statusStyleMap } from "./teamMemberForm.utils";
import { formatTimeWindow } from "@/utils/app.utils";

const { Title } = Typography;

const TeamList = () => {
  const { isLoading, teams, deleteTeamAction } = useTeamStore();
  const [editTeamData, setEditTeamData] = useState<Team | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  console.log("teams -> ", teams);

  const columns: ColDef<Team>[] = [
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: "left",
      lockPosition: true,
      filter: false,
      resizable: false,
      sortable: false,
    },
    {
      field: "id",
      headerName: "ID",
      width: 80,
      minWidth: 80,
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "role_type",
      headerName: "Role Type",
      width: 150,
    },
    {
      field: "phone_number",
      headerName: "Phone",
      tooltipValueGetter: (params) => params.data?.phone_number,
      width: 150,
    },
    {
      field: "email",
      headerName: "Email",
      tooltipValueGetter: (params) => params.data?.email,
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      cellRenderer: (params: any) => (
        <StatusBadge value={params.value} styleMap={statusStyleMap} />
      ),
    },
    {
      headerName: "Work Timings",
      valueGetter: (params) =>
        formatTimeWindow(
          params.data?.work_start_time,
          params.data?.work_end_time
        ),
      width: 150,
    },
    {
      headerName: "Break",
      valueGetter: (params) =>
        formatTimeWindow(
          params.data?.break_time_start,
          params.data?.break_time_end
        ),
      width: 150,
    },
    {
      headerName: "Skills",
      valueGetter: (params) => params.data?.skills?.join(", "),
      width: 150,
    },
    {
      field: "created_at",
      headerName: "Joined Date",
      valueGetter: (params) =>
        dayjs(params.data?.created_at).format("DD-MM-YYYY"),
      width: 150,
    },
    {
      field: "fixed_cost_for_driver",
      headerName: "Fixed Cost For Driver",
      width: 150,
    },
    {
      field: "cost_per_km",
      headerName: "Cost Per Km",
      width: 150,
    },
    {
      field: "cost_per_hr",
      headerName: "Cost Per Hr",
      width: 150,
    },
    {
      field: "cost_per_hr_overtime",
      headerName: "Cost Per Hr Overtime",
      width: 150,
    },
    createActionsColumn<Team>({
      onEdit: (team) => setEditTeamData(team),
      onDelete: deleteTeamAction,
      entityName: "Team Member",
    }),
  ];

  return (
    <div className="flex flex-col h-full">
      <Flex justify="space-between">
        <Title level={4}>Team Members</Title>
        <Button
          type="primary"
          size="small"
          onClick={() => setAddModalOpen(true)}
        >
          Add Team Member
        </Button>
      </Flex>
      <div className="flex-1 min-h-0">
        <BaseTable<Team>
          columnDefs={columns}
          rowData={teams}
          rowSelection="multiple"
          loading={isLoading}
          emptyMessage="No teams to show"
          //   pagination={true}
          containerStyle={{ height: "100%" }}
        />
      </div>

      {/* Add Team Member Modal */}
      <AddTeamMemberModal open={addModalOpen} setOpen={setAddModalOpen} />

      {/* Edit Team Member Drawer */}
      <Drawer
        onClose={() => setEditTeamData(null)}
        title="Edit Team Member"
        open={editTeamData?.id !== undefined}
        width={900}
        placement="right"
      >
        <TeamMemberForm
          initialData={editTeamData}
          onSubmit={() => setEditTeamData(null)}
        />
      </Drawer>
    </div>
  );
};

export default TeamList;
