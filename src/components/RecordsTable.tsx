import {useSuspenseQuery} from "@tanstack/react-query";
import {useRecords} from "../queries/records.ts";
import {createColumnHelper} from "@tanstack/react-table";
import PaginatedTable from "./PaginatedTable.tsx";
import {Button} from "react-aria-components";
import {Link} from "@tanstack/react-router";
import {openSigned} from "../auth.ts";
import {APP} from "../config.ts";

type Header = {
    prop: string
    label: string
    sort: boolean
    filter: boolean | "select"
}

type Record = {
    _id: string
    creationDate: string
    actionsEnabled: {
        [key: string]: boolean
    },
    read: boolean
    write: boolean
}

type Action = {
    level: string
    label: string
    endpoint: string
    hook: string
}

type RecordsResponse = {
    header: Header[]
    actions: {
        [key: string]: Action
    }
    data: Record[]
    offset: number
    limit: number
    total: number
}

export default function RecordsTable({profile, title}: {profile: string, title: string}) {
    const {data}: {data: RecordsResponse} = useSuspenseQuery(useRecords(profile))

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

    async function openExport(recordId: string, format: string) {
        await openSigned(`/app/${APP}/profile/${profile}/record/${recordId}.${format}`, true)
    }

    async function performAction(recordId: string, action: Action) {
        await openSigned(`/app/${APP}/profile/${profile}/record/${recordId}/action/${action.endpoint}`, true)
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
        cell: props => <Button
            className={props.row.original.write ? "cursor-pointer" : "cursor-not-allowed"}
            isDisabled={!props.row.original.write}
            onClick={() => deleteRecord(props.row.original._id)}>🗑️️</Button>
    }))

    columns.push(columnHelper.display({
        id: "history",
        cell: props => <Link
            to={`/profiles/$profileName/records/$recordId/history`}
            params={(prev) => ({
            ...prev,
            profileName: profile,
            recordId: props.row.original._id,
        })}>🕖</Link>
    }))

    const exports = [{name: "CMDI", type: "xml"}, {name: "HTML", type: "html"}, {name: "PDF", type: "pdf"}]

    for (const format of exports) {
        columns.push(columnHelper.display({
            id: format.name,
            cell: props => <Button
                isDisabled={!props.row.original.read}
                onClick={() => openExport(props.row.original._id, format.type)}
                className={props.row.original.read ? "cursor-pointer" : "cursor-not-allowed"}
            >{format.name}</Button>
        }))
    }

    for (const actionName in data.actions) {
        const action = data.actions[actionName]
        console.log("Action", action)
        columns.push(columnHelper.display({
            id: `action_${actionName}`,
            cell: props => {
                if (props.row.original.actionsEnabled[actionName]) {
                    return <Button
                        className={"cursor-pointer font-bold"}
                        onClick={() => {performAction(props.row.original._id, action)}}
                    >{action.label}</Button>
                }
                return <Button isDisabled={true} className={"cursor-not-allowed"}>{action.label}</Button>
            }
        }))
    }

    return (
        <>
            <h2>{title}</h2>
            <PaginatedTable data={data.data} columns={columns} />
        </>
    )
}