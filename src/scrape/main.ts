import puppeteer from "puppeteer"

const run = async () => {
    const browser = await puppeteer.launch({
        slowMo: 100
    })
    const page = await browser.newPage()

    await page.goto('https://mainichi.jp/covid19',{
        waitUntil: 'networkidle2'
    })

    const section = await page.$('#c-pref')
    if(section === null) throw new Error('セクション要素が見つかりませんでした。')

    const updateTime = await section.$('.title-block-note')
    if(updateTime === null) throw new Error('更新日時の要素が見つかりませんでした。')

    const updateTimeHandle = await updateTime.getProperty('textContent') as puppeteer.ElementHandle

    const updateTimeContext: string = await updateTimeHandle.jsonValue()
    
    console.log(new Date(updateTimeContext.replace('時点', '').replace('月', '/').replace('日', '')))

    const result: todayJapanCovid19InfectionResult = {
        updateTime: new Date(updateTimeContext.replace('時点', '').replace('月', '/').replace('日', '')),
        todayInfection: {}
    }

    for(let i=1; i<48; i++) {
        const elmHandle = await (await page.$(`#mc${i}`))?.getProperty('textContent')
        const [, prefecture, todayInfection ] = (await elmHandle?.jsonValue() as string).split(' ')
        result.todayInfection[prefecture] = Number(todayInfection)
    }

    console.log(result)

    await browser.close()
}

run()