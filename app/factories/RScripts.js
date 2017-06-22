'use strict';

angular.module('app')
	.factory('RScripts', function(){
		var RScripts = {};

		RScripts.getOutput = function() {
			return `

      ## Execute this script as:
      ## Rscript summary.R irace,Rdata output.txt
      ## The summary of the execution of irace will be printed in output.txt

      args <- commandArgs(trailingOnly = TRUE)

      iracefile <- args[1]
      file <- args[2]

      library(irace)
      load(iracefile)

      aux <- paste("# Iterations : ", length(iraceResults$iterationElites), sep="")
      write(aux, append=FALSE, file=file)
      aux <- paste("# Candidates : ", nrow(iraceResults$allConfigurations), sep="")
      write(aux, append=TRUE, file=file)
      aux <- paste("# Instances : ", nrow(iraceResults$experiments), sep="")
      write(aux, append=TRUE, file=file)
      aux <- paste("# Evaluations : ", iraceResults$state$experimentsUsedSoFar, sep="")
      write(aux, append=TRUE, file=file)
      aux <- paste("# Time : ", sum(iraceResults$experimentLog[,"time"], na.rm=TRUE), sep="")
      write(aux, append=TRUE, file=file)

      write("# Final configurations:", append=TRUE, file=file)
      configurations <- iraceResults$allConfigurations[ iraceResults$allElites[[length(iraceResults$allElites)]]  ,]
      configurations <- configurations[iraceResults$parameters$names]
      write.table(configurations, row.names=FALSE, sep=",", append=TRUE, file=file, quote = FALSE)

      write("# Parameter Frequency:", append=TRUE, file=file)
      parameters <- iraceResults$parameters
      scenario <- iraceResults$scenario
      configurations <- iraceResults$allConfigurations[iraceResults$parameters$names]

      for (param.name in parameters$names) {
        write(paste("parameter", param.name), append=TRUE, file=file)
        write(paste("type", parameters$types[param.name]), append=TRUE, file=file)
        if (parameters$types[param.name] %in% c("c","o")) {
          data <- configurations[, param.name]
          values <- parameters$domain[[param.name]]
          write(paste(paste(values,collapse=" "), "NA"), append=TRUE, file=file)
          count <- c()
          for (value in values){
            aa <- sum(data == value, na.rm=TRUE)
            count <- c(count, aa)
          }
          count <- c(count, sum(is.na(data)))
          write(paste(count,collapse=" "), append=TRUE, file=file)
        } else if (parameters$types[param.name] %in% c("i","r")) {
          data <- configurations[, param.name]
          data <- data[!is.na(data)]
          if(length(data) < 2){
            write("NONE", append=TRUE, file=file)
            next
          }
          domain <- parameters$domain[[param.name]]
          hh <- hist(data, plot=FALSE)
          write(paste(hh$breaks,collapse=" "), append=TRUE, file=file)
          write(paste(hh$density,collapse=" "), append=TRUE, file=file)
          dd <- density(data)
          write(paste(format(dd$x, scientific=F),collapse=" "), append=TRUE, file=file)
          write(paste(format(dd$y, scientific=F),collapse=" "), append=TRUE, file=file)
        } else{
          stop("Parameter type not recognized.")
        }
      }

      write("# Iteration configurations:", append=TRUE, file=file)

      for (i in 1:length(iraceResults$allElites)) {
        write(paste("# Iteration:", i), append=TRUE, file=file)
        configurations <- iraceResults$allConfigurations[ iraceResults$allElites[[i]]  ,]
        configurations <- configurations[iraceResults$parameters$names]
        write.table(configurations, row.names=FALSE, sep=",", append=TRUE, file=file, quote = FALSE)
      }
      `;
		};

		return RScripts;
	});
