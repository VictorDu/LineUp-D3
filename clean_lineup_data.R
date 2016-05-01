appendScoredLines = function (inputCsv, outputCsv, cols){
  dataset=read.csv(inputCsv, header = TRUE)
  scaleCol = function(col){
      range = range(col)
      return (scale(col, range[1], diff(range))*90+10)
  }
  for(str in cols){
    scored = scaleCol(dataset[str])
    print(colnames(scored))
    colnames(scored) = paste(colnames(scored),"Score", sep = " ")
    dataset = cbind(dataset, scored)
  }

  write.csv(dataset,outputCsv, sep = ",")
}

#Clean dataset used by Lineup project
cleanLineupData = function(inputJson, outputJson){
  library(jsonlite)
  json = fromJSON(inputJson)
  input=json$origin_path
  output=json$file_path
  cols=json$options
  appendScoredLines(input, output, cols)
  for(i in 1:length(json$options)){
    json$options[i] = paste(json$options[i], "Score", sep = " ")
  }
  outjson= toJSON(json, pretty = TRUE, auto_unbox = TRUE)
  print(outjson)
  write(outjson, file = outputJson)
}

#CLI Call
arg = commandArgs(TRUE)
print(arg[1])
cleanLineupData(arg[1], arg[2])


