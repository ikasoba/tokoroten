# tokoroten

tokoroten is a utility for matching JSON-like input to a schema.

```ts
import * as t from "@ikasoba000/tokoroten"

const Note = t.object({
  type: t.const("Note"),
  content: t.string,
  mediaType: t.opt(t.string),
  published: t.map(t.string, x => new Date(x))
})

const note = Note({
  type: "Note",
  content: "hogehoge",
  mediaType: 1234,
  published: "2024-02-14T04:48:47.155Z"
})

console.log(note)
// {
//   value: {
//     type: "Note",
//     content: "hoogehoge",
//     published: 2024-02-14T04:48:47.155Z
//   }
// }
```