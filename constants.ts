
import { Suspect, StoryStage, GameStep } from './types';

export const SYSTEM_INSTRUCTION_HOLMES = `
你是夏洛克·福爾摩斯 (Sherlock Holmes)，世界上最偉大的偵探。你正在指導一名才華橫溢的小學生（初級偵探）偵破「金顯微鏡失竊案」。
今天的破案方法涉及生物學：DNA 提取和凝膠電泳。

你的目標：
- 引導學生完成科學方法的步驟。
- 用簡單有趣的類比解釋概念（例如：細胞就像一個裝有寶藏的城堡，我們需要打破城牆（細胞膜）才能取出寶藏（DNA））。
- **絕對不要**直接給出答案。鼓勵他們觀察和思考。
- 如果他們選錯了，給出神秘但有幫助的提示，解釋為什麼那個選擇是不合邏輯的。
- 保持你的人設：邏輯嚴密，略帶戲劇性，觀察入微，不僅是科學家也是紳士。
- **必須全程使用繁體中文**。

案件信息：
- 犯罪：學校實驗室的金顯微鏡被盜了。
- 證據：現場發現了一根吃了一半的棒棒糖（唾液 = DNA！）。
- 嫌疑人：
  1. 總是流汗的清潔工（總是到處走動）。
  2. 貪吃的科學老師（喜歡甜食）。
  3. 惡作劇 Student（有人看到他在附近潛伏）。
`;

export const SUSPECTS: Suspect[] = [
  {
    id: 1,
    name: "清潔工 史威普先生",
    description: "一直在打掃衛生，但今天看起來很緊張。穿著藍色連體工作服。",
    motive: "最近因為實驗室總是太亂而被校長嚴厲批評。他曾抱怨說：「如果沒有這些該死的實驗設備，我的工作會輕鬆得多！」也許他是為了減少工作量而藏起了顯微鏡？",
    dnaProfile: [10, 25, 45, 60, 80],
    avatarPrompt: "Victorian style portrait of a nervous janitor, sweaty, blue jumpsuit, oil painting style",
    avatarUrl: "/images/suspect_janitor.png"
  },
  {
    id: 2,
    name: "比克老師 (科學狂人)",
    description: "熱愛科學和棒棒糖。白大褂上沾滿了五顏六色的化學試劑。",
    motive: "她最近癡迷於研究「超級棒棒糖」的內部晶体結構。她多次申請使用高精度設備被拒。金顯微鏡是全校唯一能滿足她研究需求的設備。",
    dnaProfile: [15, 30, 50, 65, 90],
    avatarPrompt: "Victorian style portrait of a female science teacher, crazy hair, holding sweets, colorful lab coat, oil painting style",
    avatarUrl: "/images/suspect_teacher.png"
  },
  {
    id: 3,
    name: "蒂米 (搗蛋鬼)",
    description: "以惡作劇聞名。帶著反戴的鴨舌帽，拿著滑板。",
    motive: "全校著名的搗蛋鬼。下週就是期末考試了，他曾揚言要搞個「大新聞」讓考試取消。偷走核心教學設備確實能讓實驗室停擺。",
    dnaProfile: [20, 35, 55, 70, 85],
    avatarPrompt: "Victorian style portrait of a mischievous student boy, cap backwards, smirk, oil painting style",
    avatarUrl: "/images/suspect_student.png"
  }
];

export const EVIDENCE_DNA_PROFILE = [15, 30, 50, 65, 90]; // Matches Suspect 2

export const STORY_STAGES: Record<string, StoryStage> = {
  [GameStep.INTRO]: {
    id: GameStep.INTRO,
    title: "金顯微鏡失竊案",
    backgroundPrompt: "London street, baker street exterior, foggy, victorian era, mystery atmosphere, oil painting style, high quality",
    narrative: "歡迎來到貝克街 221B。我是福爾摩斯。我們要去調查一起嚴重的盜竊案。皇家小學的金顯微鏡不見了！",
    task: "準備好你的放大鏡，我們出發吧！"
  },
  [GameStep.SCENE_INVESTIGATION]: {
    id: GameStep.SCENE_INVESTIGATION,
    title: "犯罪現場：實驗室",
    backgroundPrompt: "Victorian science laboratory interior, messy desk, broken glass, mysterious atmosphere, golden light, steampunk details, detailed illustration",
    narrative: "我們到達了現場。這裡一片狼藉。但是，罪犯總是會留下痕跡（洛卡德物質交換定律）。",
    task: "仔細觀察桌子。我們要找的是能提取 DNA 的「生物證據」。",
    quiz: {
      question: "你在桌子上發現了一根吃了一半的棒棒糖。我們應該怎麼做？",
      options: [
        {
          id: "A",
          text: "提取上面的指紋",
          isCorrect: false,
          explanation: "指紋確實可以識別身份，但我們的目標是進行更精確的 DNA 比對。棒棒糖上有什麼比指紋更豐富的生物信息嗎？"
        },
        {
          id: "B",
          text: "提取唾液中的 DNA",
          isCorrect: true,
          explanation: "精彩的演繹！唾液中含有口腔上皮細胞，那是 DNA 的寶庫。"
        },
        {
          id: "C",
          text: "嘗嘗它的味道",
          isCorrect: false,
          explanation: "天哪！作為偵探，絕對不能破壞或污染證據，更不能把它吃掉！"
        }
      ]
    }
  },
  [GameStep.EXTRACTION]: {
    id: GameStep.EXTRACTION,
    title: "實驗室：提取 DNA",
    backgroundPrompt: "Close up of a chemistry set, beakers with colorful liquids, microscope, glowing dna helix hologram, magical science atmosphere",
    narrative: "我們收集到了唾液樣本。現在，我們需要把 DNA 從細胞的「城堡」裡釋放出來。",
    task: "細胞膜就像是城堡的城牆。我們需要一種化學物質來破壞它。",
    quiz: {
      question: "我們應該向樣本中加入什麼來破壞細胞膜（主要由脂質組成）？",
      options: [
        {
          id: "A",
          text: "加入洗潔精（裂解液）",
          isCorrect: true,
          explanation: "正確！就像洗潔精能洗掉盤子上的油漬一樣，它也能溶解由脂質組成的細胞膜，釋放 DNA。"
        },
        {
          id: "B",
          text: "加入糖水",
          isCorrect: false,
          explanation: "糖水只會讓樣本變甜，細菌會很喜歡，但它無法打破細胞的防禦。"
        },
        {
          id: "C",
          text: "用顯微鏡敲碎它",
          isCorrect: false,
          explanation: "暴力不是科學的方法。細胞太小了，物理敲擊很難精準打破它們。"
        }
      ]
    }
  },
  [GameStep.PCR_GEL]: {
    id: GameStep.PCR_GEL,
    title: "跑膠：讓 DNA 賽跑",
    backgroundPrompt: "Scientific gel electrophoresis machine, glowing blue light, electrical sparks, steampunk laboratory equipment, detailed",
    narrative: "DNA 已經被提取出來了，并在 PCR 儀中被複製了數百萬次。現在，我們要看看這些 DNA 片段長什麼樣。",
    task: "我們將使用「凝膠電泳」。這就像讓 DNA 在果凍跑道上賽跑。",
    quiz: {
      question: "如果 DNA 帶負電荷，我們應該把它們放在電場的哪一端？",
      options: [
        {
          id: "A",
          text: "正極（紅色）",
          isCorrect: false,
          explanation: "異性相吸。如果放在正極，它們就會粘在那裡不動了。我們需要讓它們跑起來！"
        },
        {
          id: "B",
          text: "負極（黑色）",
          isCorrect: true,
          explanation: "正是如此！同性相斥，異性相吸。放在負極， DNA 就會向正極跑去。小片段跑得快，大片段跑得慢。"
        }
      ]
    }
  }
};
