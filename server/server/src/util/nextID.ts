import Snowflakify from "snowflakify";
const snowflakify = new Snowflakify();

export const IDPattern = /^[0-9]{1,32}$/;

export const nextID = () => {
    return snowflakify.nextId().toString();
};
