import {useSuspenseQuery} from "@tanstack/react-query";
import {useRecords} from "../queries/records.ts";
import {createColumnHelper} from "@tanstack/react-table";
import PaginatedTable from "./PaginatedTable.tsx";
import {Button} from "react-aria-components";
import {Link} from "@tanstack/react-router";
import {openSigned} from "../auth.ts";
import {APP} from "../config.ts";


type Record = {
    _id: string;
}


export default function RecordsTable({profile, title}: {profile: string, title: string}) {
    const {data} = useSuspenseQuery(useRecords(profile))

    const columnHelper = createColumnHelper<Record>()

    let columns: any[] = data.header.map((col: any) => {
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
        cell: props => <Link
            to={`/profiles/$profileName/records/$recordId/edit`}
            params={(prev) => ({
                ...prev,
                profileName: profile,
                recordId: props.row.original._id})
        }>✏️</Link>
    }))

    columns.push(columnHelper.display({
        id: "delete",
        cell: props => <Button className={"cursor-pointer"} onClick={() => deleteRecord(props.row.original._id)}>🗑️️</Button>
    }))

    columns.push(columnHelper.display({
        id: "history",
        cell: props => <Link to={`/profiles/$profileName/records/$recordId/history`} params={(prev) => ({
            ...prev,
            profileName: profile,
            recordId: props.row.original._id,
        })}>🕖</Link>
    }))

    const exports = [{name: "CMDI", type: "xml"}, {name: "HTML", type: "html"}, {name: "PDF", type: "pdf"}]

    for (const format of exports) {
        columns.push(columnHelper.display({
            id: format.name,
            cell: props => <a href={"javascript:void(0)"} onClick={() => openExport(props.row.original._id, format.type)}>{format.name}</a>
        }))
    }

    return (
        <>
            <h2>{title}</h2>
            <PaginatedTable data={data.data} columns={columns} />
        </>
    )
}