import { createFileRoute } from '@tanstack/react-router'
import {useProfile} from "../../../queries/profile.ts";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useRecord} from "../../../queries/record.ts";
import {Editor} from "../../../components/Editor.tsx";

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


function RouteComponent() {
    const {profileName, recordId} = Route.useParams()

    const profileData = useSuspenseQuery(useProfile(profileName)).data
    const recordData = useSuspenseQuery(useRecord(profileName, recordId)).data

    return <Editor profile={profileData} recordData={recordData.record} />
}
