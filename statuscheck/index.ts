import tl = require('azure-pipelines-task-lib/task');
import * as rm from 'typed-rest-client/RestClient';
import Octokit = require('@octokit/rest');


async function run() {
    try {
        const gh_pat: string = tl.getInput('ghpat', true);
        const inputString: string = tl.getInput('samplestring', true);
        if (inputString == 'bad') {
            tl.setResult(tl.TaskResult.Failed, 'Bad input was given');
            return;
        }
        console.log('Hello', inputString);
        const octokit = new Octokit({
            auth: 'token ' + gh_pat
        })


        await runTest(octokit);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }

    //let rest: rm.RestClient = new rm.RestClient("todos", "http://localhost");


    //let res: rm.IRestResponse<Todo> = await rest.get<Todo>("/api/values");

    //console.log(res.result)
}

async function runTest(octokit: Octokit){
    for (var i = 1; i <= 3; i++) {
        await octokit.repos.createStatus({
            owner: "thehabbos007", 
            repo: "CodeChallenge", 
            sha:"7a4c3b9ca6cbeebfd8e620df4aafca32d2ba52f7",
            state: "pending", 
            description: "test" + i, 
            context: "pipeline/test/" + i
        })    
    }

    let rest: rm.RestClient = new rm.RestClient("todos", "http://localhost:5000");    
    for (var i = 1; i <= 3; i++) {
        let res: rm.IRestResponse<any> = await rest.get<any>("/api/values/end"+ i);

        if(res.result == "value" + i){
            await octokit.repos.createStatus({
                owner: "thehabbos007", 
                repo: "CodeChallenge", 
                sha:"7a4c3b9ca6cbeebfd8e620df4aafca32d2ba52f7",
                state: "success", 
                description: "test" + i, 
                context: "pipeline/test/" + i
            })    
        }else{
            await octokit.repos.createStatus({
                owner: "thehabbos007", 
                repo: "CodeChallenge", 
                sha:"7a4c3b9ca6cbeebfd8e620df4aafca32d2ba52f7",
                state: "failure", 
                description: "test" + i, 
                context: "pipeline/test/" + i
            })   
        }
    }
    

}


run();