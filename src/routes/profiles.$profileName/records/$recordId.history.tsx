import {createFileRoute} from '@tanstack/react-router'
import {useHistory} from "../../../queries/history.ts";
import {useSuspenseQuery} from "@tanstack/react-query";
import {createColumnHelper} from "@tanstack/react-table";
import PaginatedTable from "../../../components/PaginatedTable.tsx";

export const Route = createFileRoute(
    '/profiles/$profileName/records/$recordId/history',
)({
    component: RouteComponent,
    loader: ({params, context}) => {
        context.queryClient.ensureQueryData(useHistory(params.profileName, params.recordId))
    }
})

type RecordHistory = {
    epoch: number,
    timestamp: string,
    user: string
}

function RouteComponent() {
    const {profileName, recordId} = Route.useParams()

    const {data} = useSuspenseQuery(useHistory(profileName, recordId))

    console.log(data)

    const columnHelper = createColumnHelper<RecordHistory>()

    const columns = [
        columnHelper.accessor('epoch', {
            header: "Epoch",
            cell: info => info.getValue()
        }),
        columnHelper.accessor('timestamp', {
            header: "Timestamp",
            cell: info => info.getValue()
        }),
        columnHelper.accessor('user', {
            header: "User",
            cell: info => info.getValue()
        }),
    ]

    return <div>
        <h1 className={"text-2xl"}>History for record {recordId}</h1>
        <PaginatedTable data={data.history} columns={columns} />
    </div>
}
