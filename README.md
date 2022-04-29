# Target Chart

## Overview

Hi there! I highly recommened checking out the readme file for the parent chart (Custom PBI Column Chart, aka stackedHistogramLined), as this chart was developed using its predecessor as a reference. This chart is *not* designed as replacement for the previous chart (it serves a different purpose), though many features have been revamped and/or upgraded, so we can consider it a spiritual successor in some ways lol. 

For the purposes of this readme file, I'll mainly go over the technical details, and skip over the general stuff - environment setup and everything else can be found through the previous chart's readme.

## Project Structure

The project is divided into three main components: The settings.ts/capabilities.json is where the user-inputted settings are defined; dataProcess.ts processes the data; d3Visual.ts renders the actual chart. For the most part, this is where I did all my development. The other files aren't particularly relevant, though I'll quickly touch on them anyway.

interfaces.ts: definition of some useful data structures to be used later

visual.ts: you could consider this the "main" file - this is the file that's run every time the chart is rendered/updated. Funnily enough though, most of the processing has all been offloaded to the other files, so not much actually happens here. 

pbiviz.json: apart from capabilities.json, this is the only other json file that I bothered to update, it's pretty self-explanatory, just open it and see lol

\dist: this folder contains all the chart versions

\assets: this folder contains the chart icon

The files that I haven't already mentioned probably aren't particularly useful, or very self-explanatory.

## FAQ (??)

Well, I haven't actually gotten any questions so this section is just me predicting what might come up in the future. Hopefully it helps lol.

### How do the growth indicators work?

Short answer: Check the user manual, I go over the behaviour there.

Slightly longer answer: The growth indicators are the labels that sit either above or beside the bars on the chart (if you have less than two bars it's not going to work well). They have little arrows that point to the bars and generally show some percentage in a little white circle. For the previous chart, since there were two layouts, the growth indicators had two different behaviours depending on which layout it was in. For this chart, where there is only a single layout, the growth indicators will follow the behaviour of the previous chart's "clustered column" layout. You can reference the user manual to find the specifics

### My custom settings aren't showing up

This happened pretty frequently when I was working on the chart, it happens because your setting name defined in capabilities.json doesn't match the name in settings.ts. Check to make sure there's no typos in the names defined in those two files, and then refresh the settings tab in PowerBI (you can do that by switching to the "Fields" tab and then switching back to "Format").

### Chart doesn't render/can't connect to server/everything is broken

For starters, you should be using the developer visual in Power BI. You can learn how to set that up from a quick google search or using the resources I'll link below. Make sure you refresh the developer visual or set it to auto-refresh. Also, make sure the server is up and running (pbivz start). Other causes might be because you don't have any data added to the chart, or your data is invalid somehow. 

## Resources
- PowerBI Visuals Documentation https://docs.microsoft.com/en-us/power-bi/developer/visuals/
- PowerBI Dev Camp https://www.powerbidevcamp.net/
- Typescript Handbook https://www.typescriptlang.org/docs/handbook/intro.html
- D3 documentation https://d3js.org/
- D3 videos https://www.youtube.com/watch?v=TOJ9yjvlapY&list=RDCMUCSJbGtTlrDami-tDGPUV9-w&start_radio=1&rv=TOJ9yjvlapY&t=0
- Link to previous chart: https://github.com/JesseXia-Rogers/stackedHistogramLined

Good luck! 😄
