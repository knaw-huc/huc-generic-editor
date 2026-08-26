import { createFileRoute } from '@tanstack/react-router'
import {useProfiles} from "../queries/profiles.ts";
import {useSuspenseQuery} from "@tanstack/react-query";
import RecordsTable from "../components/RecordsTable.tsx";


export const Route = createFileRoute('/')({


    component: RouteComponent,
    loader: ({context}) => {
        context.queryClient.ensureQueryData(useProfiles())
    }
})

function RouteComponent() {
    const {data} = useSuspenseQuery(useProfiles())

    console.log(data)

    return <div>
        <h1 className={"text-2xl"}>Index</h1>
        {Object.keys(data).map((key: string) => {
            return <RecordsTable profile={key} title={data[key].label_plural_en} key={key}/>
        })}
    </div>
}



