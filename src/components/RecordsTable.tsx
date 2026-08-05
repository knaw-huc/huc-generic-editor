import {useSuspenseQuery} from "@tanstack/react-query";
import {useRecords} from "../queries/records.ts";
import {createColumnHelper} from "@tanstack/react-table";
import PaginatedTable from "./PaginatedTable.tsx";
import {Button} from "react-aria-components";
import {Link} from "@tanstack/react-router";
import {openSigned} from "../auth.ts";
import {APP} from "../config.ts";


export default function RecordsTable({profile, title}: {profile: string, title: string}) {
    const {data} = useSuspenseQuery(useRecords(profile))

    const columnHelper = createColumnHelper()

    let columns: any[] = data.header.map((col) => {
        return columnHelper.accessor(col.prop, {
            cell: (info) => info.getValue(),
            header: () => col.label,
        })
    })

    function deleteRecord(recordId: string) {
        console.log("delete", recordId)
    }

    function openExport(recordId: string, format: string) {
        openSigned(`/app/${APP}/profile/${profile}/record/${recordId}.${format}`, true)
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

    const exports = [{name: "CMDI", type: "xml"}, {name: "HTML", type: "html"}, {name: "PDF", type: "pdf"}]

    for (const format of exports) {
        columns.push(columnHelper.display({
            id: format.name,
            cell: props => <Button onClick={() => openExport(props.row.original._id, format.type)}>{format.name}</Button>
        }))
    }

    return (
        <>
            <h2>{title}</h2>
            <PaginatedTable data={data.data} columns={columns} />
        </>
    )
}