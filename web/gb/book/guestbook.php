<?php

// GuestBook powered by Necromanthus (please do not remove this line)
$filename = "guestbook.txt";
$NumL 		= $_REQUEST["vr1"];
$Submit		= $_REQUEST["vr2"];
$Nume 		= $_POST["vr3"];
$Email 		= $_POST["vr4"];
$WebSit		= $_POST["vr5"];
$Coment		= $_POST["vr6"];
$Nume 		= ereg_replace("[^A-Za-z0-9 ]", "", $Nume);
$Email 		= ereg_replace("[^A-Za-z0-9 \.\-\@\_]", "", $Email);
$msginp		= array("fuck","asshole","<","\r","&");
$msgout 	= array("f**k","a*****e"," ","<br>","and");
for ($n = 0; $n < 5; $n++) {
	$Coment		= eregi_replace($msginp[$n], $msgout[$n], $Coment);
}
$Coment		= ereg_replace("[^A-Za-z0-9 \.\-\@\_\<br>\?\*]", " ", $Coment);
$WebSit		= eregi_replace("http://", "", $WebSit);
$WebSit		= ereg_replace("[^A-Za-z0-9 \@\.\-\/\'\~\:\_]", "", $WebSit);
$Nume 		= stripslashes($Nume);
$Email 		= stripslashes($Email);
$WebSit		= stripslashes($WebSit);
$Coment 	= stripslashes($Coment);
if ($Submit == "Yes") {
	$fp = fopen( $filename,"r");
	$size = filesize($filename);
	$OldData = fread($fp, $size);
	fclose($fp);
	$Today 		= (date ("l dS of F Y ( h:i:s A )",time()));
	$Input = "Name: <font color='#bbffbb'>$Nume</font><br>E-mail: <font color='#ffbbbb'><u><a href=\"mailto:$Email\">$Email</a></u></font><br>WebSite: <font color='#bbbbff'><u><a href=\"http://$WebSit\" target=\"_blank\">$WebSit</a></u></font><br>Notes: <font color='#ffffbb'>$Coment</font><br><br><font size=\"-2\"><i>Data: $Today</i></font><br>\r\n";
	$New = "$Input$OldData";
	$fp = fopen( $filename,"w");
	fwrite($fp,$New);
	fclose($fp);
	print "&gbrez=ok";
}
$fp = fopen( $filename,"r");
$size = filesize($filename);
$Data = fread($fp, $size);
fclose($fp);
$DataArray = split ("\r\n", $Data);
$NumEnt = count($DataArray) - 1;
Print "&TotEnt=$NumEnt&NumL=$NumL&Ecran=";
$gbend = 0;
for ($n = $NumL; $n < ($NumL+10); $n++) {
	if (!$DataArray[$n]) {
		Print "<p align='center'><b>...VÉGE...</b></p>";
		$gbend = 1;
		Print "&gbend=$gbend";
		exit;
	}else{
		$msgnr = $NumEnt - $n;
		Print "<p align='center'><b>msg.$msgnr</b></p>$DataArray[$n]------------------------------------------------------------------------------<br>";
	}
}
Print "&gbend=$gbend";

?>
