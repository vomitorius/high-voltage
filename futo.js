
function setFocus(){
	futoszoveg(50,1);
}

function futoszoveg(mag,forgat)
{
  
  
  var text1  = ":::::::::::::::WWW.HIGH-VOLTAGE.HU:::::::::::::::::::";
  var text2  = "........A High Voltage zenekar hivatalos oldala........";        
  
  
  
  var uzenet=text1+text2;
  
  var szunet = " ";
  
  var c   = 1;

  if (forgat > 10) { 
		window.status="<Thanks !>";
  }
  else if (mag > 100) {
			mag--;
			var cmd="futoszoveg(" + mag + "," + forgat + ")";
			timerTwo=window.setTimeout(cmd,100);
  }
  else if (mag <= 100 && mag > 0) {
    for (c=0 ; c < mag ; c++) { 
		szunet+=" ";
	}
		szunet+=uzenet.substring(0,100-mag);	
		mag--;
		var cmd="futoszoveg(" + mag + "," + forgat + ")";
		window.status=szunet;
		timerTwo=window.setTimeout(cmd,100);
  }
  else if (mag <= 0) {
    if (-mag < uzenet.length) {
      szunet+=uzenet.substring(-mag,uzenet.length);
      mag--;
      var cmd="futoszoveg(" + mag + "," + forgat + ")";
      window.status=szunet;
      timerTwo=window.setTimeout(cmd,100); 
    }
    else {
      window.status=" ";
      forgat += 1;
      var cmd = "futoszoveg(100," + forgat + ")";
      timerTwo=window.setTimeout(cmd,75);
    }
  }
}

