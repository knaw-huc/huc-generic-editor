import {useSuspenseQuery} from "@tanstack/react-query";
import {useRecords} from "../queries/records.ts";
import {createColumnHelper} from "@tanstack/react-table";
import PaginatedTable from "./PaginatedTable.tsx";
import {Button} from "react-aria-components";
import {Link} from "@tanstack/react-router";


export default function RecordsTable({profile, title}: {profile: string, title: string}) {
    const {data} = useSuspenseQuery(useRecords(profile))

    const columnHelper = createColumnHelper()

    let columns: any[] = data.header.map((col) => {
        return columnHelper.accessor(col.prop, {
            cell: (info) => info.getValue(),
            header: () => col.label,
        })
    })

    function deleteRecord(recordId) {
        console.log("delete", recordId)
    }

    columns.push(columnHelper.display({
        id: "edit",
        cell: props => <Link to={`/profiles/${profile}/records/${props.row.original._id}/edit`}>✏️</Link>
    }))

    columns.push(columnHelper.display({
        id: "delete",
        cell: props => <Button onClick={() => deleteRecord(props.row.original._id)}>🗑️️</Button>
    }))

    columns.push(columnHelper.display({
        id: "history",
        cell: props => <Link to={`/profiles/${profile}/records/${props.row.original._id}/history`}>🕖</Link>
    }))

    return (
        <>
            <h2>{title}</h2>
            <PaginatedTable data={data.data} columns={columns} />
        </>
    )
}