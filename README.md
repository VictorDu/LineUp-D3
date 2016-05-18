# LineUp-D3
## Description
A project that implement Lineup project in D3.js.

Lineup comes from the paper: [LineUp: Visual Analysis of Multi-Attribute Rankings](http://www.jku.at/cg/content/e152197/e212741/2013_InfoVis_Gratzl_LineUp.pdf). It is a tool for multi-attribute ranking visualization.

As the final assignment for Data Graphics course in USF, we\([Wentao Du](https://github.com/VictorDu), [Siwei Zhang](https://github.com/daniel0128), [Kaijie Zhou](https://github.com/kaijiezhou) \) implemented a subset for Lineup in [D3.js](https://d3js.org/) and Javascript.

In this project, we use [R script](https://www.r-project.org/) to clean the incoming dataset. We need use to provide a Json file to tell us which attributes are needed to be used for ranking. The R script will transform the dataset into the input of our Javascrip function. And the Javascript function will show the ranking table.

For now, we've already cleaned four datasets for demo: University ranking for 2013, Cars dataset and NBA player performance dataset for 2009. We also provide a control panel for user to play with the datasets we provided. The control panel is implemented by [Bootstrap](http://getbootstrap.com/).
## Contents
**index.html:** The index page of the project demo. The implementation of control panel is here.

**js/line_up.js:** The core functions for lineup project including ranking, drag-able edges and so on.

**js/vertical_bars.js:** The core functions for header histogram. Also a part of lineup core functions.

**clean_lineup_data.R** The script for cleaning data for Lineup project. *Usage*: *RScript clean_lineup_data.R path/to/input.json path/to/output.json*

**origin/:** This folder contains all the original datasets and json files for the R script.

**data/:** This folder contains all the cleaned data and json files generated by the R script. They are ready to be used for our project

**Lineup D3 Impl Slides.pptx:** The slides for our final presentation. See also [here](https://docs.google.com/a/dons.usfca.edu/presentation/d/1NqDgILNa2NBvdJZY9Ar2MIBBa_Si_dhg5cbxnQlMGuY/edit?usp=sharing).
 
**Processbook.pdf** The process book for the project which note down the progress of each release for our project. See also [here](https://docs.google.com/a/dons.usfca.edu/document/d/1P7L8JKjeKfg6s4DxLIJXFU6Qo_s0wf4lckfILkLNtjk/edit?usp=sharing).

**Other files** Includes *css/*, *fonts/*, *images/* and other files in *js*. These files are used by Bootstrap.

## Demo link

You can see the demo of this project though [this link](http://victordu.github.io/LineUp-D3/).



