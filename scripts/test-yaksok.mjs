import { YaksokSession } from "@dalbit-yaksok/core";

const s = new YaksokSession();
s.addModule("main", "안녕, 샘플");
await s.runModule("main");
console.log("샘플 실행 완료");
