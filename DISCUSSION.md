## 6-11-2019

1. Is the json file typed?

Now:


```
obj: { id: null; content: any; record: undefined; }

```


let validationProfiles: any[] = [];

2. profileID



3.             

$(this).val(obj.attributes[$(this).attr("data-attribute_name")]);

met 

Type 'undefined' cannot be used as an index type.ts(2538)
vervangen 
            let x: string = $(this).attr("data-attribute_name") as string;
            $(this).val(obj.attributes[x]);