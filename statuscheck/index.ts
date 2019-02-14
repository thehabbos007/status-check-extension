import tl = require('azure-pipelines-task-lib/task');
import * as rm from 'typed-rest-client/RestClient';

interface Todo{
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

async function run() {
    try {
        const inputString: string = tl.getInput('samplestring', true);
        if (inputString == 'bad') {
            tl.setResult(tl.TaskResult.Failed, 'Bad input was given');
            return;
        }
        console.log('Hello', inputString);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }

    let rest: rm.RestClient = new rm.RestClient("todos", "http://localhost");


    let res: rm.IRestResponse<Todo> = await rest.get<Todo>("/api/values");

    console.log(res.result)
}


run();