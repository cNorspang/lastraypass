import { ActionPanel, Icon, List, LocalStorage, Detail, Action, useNavigation} from "@raycast/api"
import { execSync } from "child_process"

export default function Command() {
    const { push } = useNavigation();
    process.env.PATH = process.env.PATH + ':/opt/homebrew/bin' + ':/usr/bin'
    let passstring = passlistgetter();

    let passlist = passstring.split("\n")
    console.log(passstring);
    
    

    return <List>
        {passlist.map((pass, index) => (
            <List.Item title={pass} key={index} actions = {
                <ActionPanel>
                    <Action title = "Select" onAction={() => {passgetter(pass); push(<Success/>)}}/>
                </ActionPanel>
            }/>
        ))}
    </List>
}

 function passlistgetter() {
    let test;
    test = execSync('lpass ls');
    

        // printer = JSON.stringify(passlist).replace('\\uffffffc3\\uffffffb8/g', 'ø')
        // printer = printer.replaceAll('\\uffffffc3\\uffffffb8', 'ø')
        // printer = printer.replaceAll('\\uffffffc3\\uffffffa6', 'æ')
        // printer = printer.replaceAll('\\uffffffc3\\uffffffa5', 'å')
        // printer = printer.replaceAll('\\uffffffc3\\uffffff86', 'Æ')
        // printer = printer.replaceAll('\\uffffffc3\\uffffff98', 'Ø')
        // printer = printer.replaceAll('\\uffffffc3\\uffffff85', 'Å')
        //setPasslist(printer)
    //return temp;
    return test.toString();
};

function passgetter(passname: String) {
   
    let filteredName = passname.substring(passname.indexOf(':') + 2, passname.indexOf(']'))
    let res = execSync(`lpass show ${filteredName} -j`)
    let resString = res.toString()
    let resJSON = JSON.parse(resString);
    let extracted_pass =resJSON[0].password;

    pbcopy(extracted_pass);
}

function pbcopy(data: String) {
    var proc = require('child_process').spawn('pbcopy');
    proc.stdin.write(data);
    proc.stdin.end();
  }

function Success() {
    return <Detail markdown="Copied to clipboard"/>
}