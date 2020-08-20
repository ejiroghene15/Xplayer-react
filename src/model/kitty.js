import mongoose, { kittySchema } from "./db";

const Kitten = mongoose.model("Kitten", kittySchema);

export const silence = new Kitten({ name: "Silence" });
console.log(silence.name); // 'Silence'
