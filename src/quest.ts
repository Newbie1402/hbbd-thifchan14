export const questIds = ['open_memories','read_secret_note','blow_candles','open_surprise'] as const;
export type QuestId = typeof questIds[number];
export type QuestState = Record<QuestId,boolean>;
const key='birthday-quest-v1';
const emptyQuest:QuestState={open_memories:false,read_secret_note:false,blow_candles:false,open_surprise:false};
export function readQuest(storage:Pick<Storage,'getItem'>):QuestState{try{const value=JSON.parse(storage.getItem(key)||'{}') as Partial<QuestState>;return Object.fromEntries(questIds.map(id=>[id,value[id]===true])) as QuestState;}catch{return {...emptyQuest};}}
export function completeQuest(storage:Pick<Storage,'getItem'|'setItem'>,id:QuestId):{state:QuestState;changed:boolean}{const state=readQuest(storage);if(state[id])return {state,changed:false};const next={...state,[id]:true};storage.setItem(key,JSON.stringify(next));return {state:next,changed:true};}
export function resetQuest(storage:Pick<Storage,'removeItem'>){storage.removeItem(key);}
export const questCount=(state:QuestState)=>questIds.filter(id=>state[id]).length;
