import { createFileRoute } from '@tanstack/react-router'
import {useProfile} from "../../../queries/profile.ts";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useRecord} from "../../../queries/record.ts";

export const Route = createFileRoute(
    '/profiles/$profileName/records/$recordId/edit',
)({
    component: RouteComponent,
    loader: ({params, context}) => {
        console.log(params)
        context.queryClient.ensureQueryData(useProfile(params.profileName))
        context.queryClient.ensureQueryData(useRecord(params.profileName, params.recordId))
    }
})

function renderContent (item, value) {
    console.log("Rendering ", item.name)
    console.log(item)
    console.log(value)
    if (item.type === "component") {
        // return <div className={"pl-4 mb-4"}>
        //     <p className={"text-lg"}>{item.cues.label}</p>
        //     {item.content.map(i => renderContent(i, value?.[i.name]))}
        // </div>
        if (item.cardinality.max != "1") {
            return <ComponentList profile={item} values={value} />
        }
        return <Component profile={item} value={value} />
    }

    return <Element value={value} profile={item} />
}

function RouteComponent() {
    const {profileName, recordId} = Route.useParams()

    const profileData = useSuspenseQuery(useProfile(profileName)).data
    const recordData = useSuspenseQuery(useRecord(profileName, recordId)).data

    console.log(profileData)
    console.log(recordData)

    return <div>
        {profileData.content.map(data => renderContent(data, recordData.record?.[data.name] || ""))}
    </div>
}

function ComponentList({profile, values}) {
    if (!Array.isArray(values)) {
        values = [values]
    }
    return <div>
        {values.map((value, index: number) => <Component key={`${profile.name}_${index}`} profile={profile} value={value} />)}
        <hr className={"my-4"} />
    </div>
}


function Component({profile, value}) {
    return <div>
        <p className={"text-lg"}>{profile.name}</p>
        {profile.content.map(i => renderContent(i, value?.[i.name] || ""))}
    </div>
}

function Element({profile, value}) {

    function renderInputs() {
        if (Array.isArray(value)) {
            return value.map((value, index: number) => (
                <input key={index} className={"px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"} name={profile.id} id={profile.id} type={"text"} value={value['@value']} />
            ))
        }
        return <input className={"px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"} name={profile.id} id={profile.id} type={"text"} value={value['@value']} />
    }

    return <div className={"pl-1"}>
        <label for={profile.id}>{profile.name}</label>
        {/*<input className={"px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"} name={profile.id} id={profile.id} type={"text"} value={value} />*/}
        {renderInputs()}
    </div>
}