
export type Value = {
    "@value": string
    [key: string]: Value | Value[] | string
}

export type Profile = {
    id: string,
    level: number,
    cues: object,
    name: string,
    type: "element" | "component"
    content: Profile[],
    cardinality: {
        min: string,
        max: string
    }
}

function renderContent (item: Profile, value: Value | Value[] | string) {
    console.log("Rendering ", item.name)
    console.log(item)
    console.log(value)

    if (typeof value === "string") {
        // For Typescript, can't happen (only @value is a string)
        return;
    }

    if (item.type === "component") {
        if (item.cardinality.max != "1") {
            return <ComponentList profile={item} values={value as Value[]} />
        }
        return <Component profile={item} value={value as Value} />
    }

    return <Element value={value} profile={item} />
}

function ComponentList({profile, values}: {profile: Profile, values: Value[]}) {
    if (!Array.isArray(values)) {
        values = [values]
    }
    return <div>
        {values.map((value, index: number) => <Component key={`${profile.name}_${index}`} profile={profile} value={value} />)}
        <hr className={"my-4"} />
    </div>
}


function Component({profile, value}: {profile: Profile, value: Value}) {
    return <div className={"pl-4"}>
        <p className={"text-lg"}>{profile.name}</p>
        {profile.content.map(i => renderContent(i, value?.[i.name] || ""))}
    </div>
}

function Element({profile, value}: {profile: Profile, value: Value | Value[]}) {

    function renderInputs() {
        if (Array.isArray(value)) {
            return value.map((value, index: number) => (
                <input key={index} className={"px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"} name={profile.id} id={profile.id} type={"text"} value={value['@value']} />
            ))
        }
        return <input className={"px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"} name={profile.id} id={profile.id} type={"text"} value={value['@value']} />
    }

    return <div className={"pl-4"}>
        <label htmlFor={profile.id}>{profile.name}</label>
        {/*<input className={"px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"} name={profile.id} id={profile.id} type={"text"} value={value} />*/}
        {renderInputs()}
    </div>
}

export function Editor({profile, recordData}: {profile: Profile, recordData: Value}) {
    return <div>
        {profile.content.map((data: Profile) => renderContent(data, recordData?.[data.name] || ""))}
    </div>
}