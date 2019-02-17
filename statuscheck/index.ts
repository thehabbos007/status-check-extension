import tl = require('azure-pipelines-task-lib/task');
import * as rm from 'typed-rest-client/RestClient';
import Octokit = require('@octokit/rest');


async function run() {
    try {
        const gh_pat: string = tl.getInput('ghpat', true);
        const merge_sha: string = tl.getInput('mergesha', true);
        if (merge_sha == 'bad') {
            tl.setResult(tl.TaskResult.Failed, 'Bad input was given');
            return;
        }
        console.log('Got merge sha: ', merge_sha);
        /*let mergeSha = "";
        await require('child_process').exec('git rev-parse HEAD', function(err:any, stdout:string) {
            console.log('Merge request sha is: ', stdout);
            mergeSha = stdout;
        });*/

        const octokit = new Octokit({
            auth: 'token ' + gh_pat
        })

        const result = await octokit.repos.getCommit({
            owner: "thehabbos007", 
            repo: "CodeChallenge", 
            sha: merge_sha,
        })

        let sha = result.data.parents[result.data.parents.length-1].sha;
        console.log('Parent commit sha: ', result.data.parents);

        await runTest(octokit, sha);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }

    //let rest: rm.RestClient = new rm.RestClient("todos", "http://localhost");


    //let res: rm.IRestResponse<Todo> = await rest.get<Todo>("/api/values");

    //console.log(res.result)
}

async function runTest(octokit: Octokit, sha: string){
    console.log('Operating on commit :', sha);

    for (var i = 1; i <= 3; i++) {
        await octokit.repos.createStatus({
            owner: "thehabbos007", 
            repo: "CodeChallenge", 
            sha: sha,
            state: "pending", 
            description: "test" + i, 
            context: "pipeline/test/" + i
        })    
    }

    let rest: rm.RestClient = new rm.RestClient("todos", "http://localhost");    
    for (var i = 1; i <= 3; i++) {
        let res: rm.IRestResponse<any> = await rest.get<any>("/api/values/end"+ i);

        if(res.result == "value" + i){
            await octokit.repos.createStatus({
                owner: "thehabbos007", 
                repo: "CodeChallenge", 
                sha: sha,
                state: "success", 
                description: "test" + i, 
                context: "pipeline/test/" + i
            })    
        }else{
            await octokit.repos.createStatus({
                owner: "thehabbos007", 
                repo: "CodeChallenge", 
                sha: sha,
                state: "failure", 
                description: "test" + i, 
                context: "pipeline/test/" + i
            })   
        }
    }    

}


run();