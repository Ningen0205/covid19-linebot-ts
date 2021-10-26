import puppeteer from 'puppeteer';

const getUpdatedTime = async (section: puppeteer.ElementHandle) => {
    const updatedTime = await section.$eval('.title-block-note', (e) => e.textContent);
    if (updatedTime === null) {
        throw new Error('更新日時情報が見つかりませんでした。');
    }

    const replacedUpdatedTime = updatedTime.replace('時点', '').replace('月', '/').replace('日', '');
    const dateUpdatedTime = new Date(replacedUpdatedTime);
    return dateUpdatedTime;
};

const getSection = async (page: puppeteer.Page) => {
    const section = await page.$('#c-pref');
    if (section === null) {
        throw new Error('セクション要素が見つかりませんでした。');
    }

    return section;
};

const getTodayJapanCovid19InfectionResult = async (updatedTime: Date, page: puppeteer.Page) => {
    const result: todayJapanCovid19InfectionResult = {
        updateTime: new Date(),
        todayInfection: {},
    };

    for (let i = 1; i < 48; i++) {
        const elmHandle = await (await page.$(`#mc${i}`))?.getProperty('textContent');
        const [, prefecture, todayInfection] = ((await elmHandle?.jsonValue()) as string).split(' ');
        result.todayInfection[prefecture] = Number(todayInfection);
    }

    return result;
};

const run = async (): Promise<todayJapanCovid19InfectionResult> => {
    const browser = await puppeteer.launch({
        slowMo: 100,
    });
    const page = await browser.newPage();

    await page.goto('https://mainichi.jp/covid19', {
        waitUntil: 'networkidle2',
    });

    const section = await getSection(page);
    const updatedTime = await getUpdatedTime(section);
    const scrapeResult: todayJapanCovid19InfectionResult = await getTodayJapanCovid19InfectionResult(updatedTime, page);

    await browser.close();
};

run();
