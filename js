function standingsByWeek(tournamentID,seasonID)  {
  const baseURL = 'https://www.sofascore.com/';
  var league,
       weeks,
       matches,
       teams,
       teamsIDs,
       standings,
       currentWeekIndex = 0,
       table = {},
       possiblePoints = [3,1,0];
  get( baseURL + 'u-tournament/' + tournamentID + '/season/' + seasonID + '/json').then(function(league) { //get data for league
    league = JSON.parse(league);
    weeks = league.events.weeks;
    teams = league.teams;
    
    for (let i = 0; i < teams.length; i++) {   //fill up table with teams
      table[teams[i].id] = { id : teams[i].id, home : [0,0,0,0,0,0,teams[i].id], away : [0,0,0,0,0,0,teams[i].id]} ; // wins,draws,losses,score,conceded,points
    }; 
    teamsIDs = Object.keys(table); //extract keys (teamsIDs) from table
    return get( baseURL + 'u-tournament/'+tournamentID+'/season/'+seasonID+'/matches/week/'+weeks[0].weekStartDate+'/'+weeks[weeks.length-1].weekEndDate)// get data for matches 
    }).then(function(matches) { 
      matches = JSON.parse(matches).weekMatches.tournaments[0].events; // assign matches to matches
  
      
        for (let i = 0; i < matches.length; i++) { //update the table for every finished match
          with (matches[i]){  
            
            if(status.code != 100){continue} // continue if match not finished
          
          var outcome = Math.sign(homeScore.normaltime - awayScore.normaltime); // get outcome 1 = win , 0 = draw , -1 lose (for home team)
                table[homeTeam.id].home[Math.abs(outcome - 1)] ++; //  incrementing number at index for outcome 
                table[awayTeam.id].away[outcome + 1] ++;           //                -||-
    
                table[homeTeam.id].home[3] += homeScore.normaltime; // adding scored goals in home team's home table
                table[homeTeam.id].home[4] += awayScore.normaltime; // adding conceded goals in home team's home table
                table[awayTeam.id].away[3] += awayScore.normaltime; // adding scored goals in away team's away table
                table[awayTeam.id].away[4] += homeScore.normaltime; // adding conceded goals in away team's away table
    
                table[homeTeam.id].home[5] += possiblePoints[Math.abs(outcome - 1)]; // adding earned points to home team's home table
                table[awayTeam.id].away[5] += possiblePoints[Math.abs(outcome + 1)]; // adding earned points to away team's away table
     
            }
                   // if this is the last match of the season or current week ended ,sort the table and push standings to that week and increase current week index
          if ( (i + 1) == matches.length || weeks[currentWeekIndex].weekEndDate < matches[i + 1].startTimestamp ) { 
            
            
             standings = {home : [], away:[] };
               
            for (let j = 0; j < 2; j++) { // loop through both keys in standings
              var HoA = Object.keys(standings)[j]; //home or away 
          k : for (let k = 0; k < teamsIDs.length; k++) { // loop through all teams in the table
                for (let l = 0; l <= standings[HoA].length; l++) { // loop through all teams added to standings
                        var EoL =  Boolean(l == standings[HoA].length) // empty or last
                        var tableTeam = table[teamsIDs[k]][HoA] ; 
                        var standingsTeam = EoL ? null : standings[HoA][l]; //standings team or null if standings is empty
                        var pointDiff = l == standings[HoA].length ?  null : Math.sign(tableTeam[5] - standingsTeam[5])  ; // point difference 1 = table team has more, 0 = equal # of points, -1= standings team has more points
                         
                        // standings empty(or last) or more points or equal points and better goal difference
                        if ( EoL ||  (pointDiff == 1) || !pointDiff && (tableTeam[3] - tableTeam[4]) > (standingsTeam[3] - standingsTeam[4] ) ) {      
                          standings[HoA].splice(l,0,table[teamsIDs[k]][HoA]); // put team from table to index at which team which it was compared to was
                          continue k // go to another team
                        }
                        
                      }         
              }
        } 

             //  USING THIS INSTEAD OF LINE BELOW IT YOU CAN SEE WHAT VALUE IS BEING ASSIGNED TO STANDINGS PROPERTY OF WEEK OBJECT
             //Object.defineProperty(weeks[currentWeekIndex],'setter',{set: function (value) {this.standings = value;console.log(currentWeekIndex,value);}})
             // weeks[currentWeekIndex].setter = Object.assing({},standings);
            weeks[currentWeekIndex].standings = Object.assign({},standings);// assigning standings clone to standing property of current week 
          
            currentWeekIndex++;// increase week index 
        }
          }     
          console.log(weeks[0].standings);
               
      }
    )
  }
standingsByWeek(17,13380); // premier league  , season 17/18 
