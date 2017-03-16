# What is GTD ?
 > GTD—or “Getting things done”—is a framework for organizing and tracking your tasks and projects. Its aim is a bit higher than just “getting things done”, though. (It should have been called “Getting things done in a much better way than just letting things happen, which often turns out not to be very cool at all”.) Its aim is to make you have 100% trust in a system for collecting tasks, ideas, and projects—both vague things like “invent greatest thing ever” and concrete things like “call Ada 25 August to discuss cheesecake recipe”. Everything!

 Read on [here](https://hamberg.no/gtd/#what-is-gtd) to know more!

# synopsis
Alhough creating a *todo list like* application seems like an easy programming task, applying a new productivity framework effectively would require a seamless, easy-to-use application with a full proof ui/ux . And starting with its back-end functionality is the best way to go. So cheers to `cli`'s!

# installation
```bash
# prerequisites: disregard if you have installed typescript and typings
npm install typescript typings --global

#
git clone https://github.com/chardskarth/gtd-backend.git && cd git-backend
npm install && typings install
tsc # build the typescripts
# yass!
# gtd config init <-- would create the database
```
then you are good to go!

# usage
First, lets create the database.

## config

`gtd config <sub_cmd>`

|sub_cmd|description|
|---|---|
|init|create a database|

----

The heart of GTD would fall down to 4 things: task, context, folder and agenda.

## task
`gtd task <sub_cmd>`

The parameter `toInsertTo` specifies the index to which the task should be inserted to.
`gtd task list`
```
{_id: 1, name: task3 ...}
{_id: 2, name: task2 ...}
{_id: 3, name: task1 ...}
```
and after an execution of 
`gtd task sort 3 1 & gtd task list`
would render
```
{_id: 3, name: task1 ...}
{_id: 1, name: task3 ...}
{_id: 2, name: task2 ...}
```
and then
`gtd task sort 2 2 & gtd task list`
would output
```
{_id: 3, name: task1 ...}
{_id: 2, name: task2 ...}
{_id: 1, name: task3 ...}
```

The parameter `allOrNotDone` are allowed 3 values: 
* `undefined` - returns all tasks.
* `truthy` value - returns only the tasks that are not yet finished
* `falsy` value - returns only the finished tasks

|sub_cmd|description|arguments|
|---|---|---|
|create|create a task| `name`, `desc`, `folderId`, `contextId`, `agendaId`|
|sort|sort unorganized tasks by selected order index|`taskId`, `toInsertTo`(number)|
|list|list unorganized task||
|list-by-parent (list-p)|list task by parent task. |`taskId`, `parentTaskId`, `allOrNotDone`|
|sort-by-parent (sort-p)|sorts tasks by parent task|`taskId`, `toInsertTo` |
|set-parent|set task a parent task. A task with a folder cannot have a parent task, if `shouldForce` is set,  the task's folder will be **unset**.|`taskId`, `parentTaskId`, `shouldForce`|
|done|set task as finished|`taskId`|
|undone|unfinish the task that was previously marked as finished|`taskId`|
## folder
`gtd folder <sub_cmd>`

|sub_cmd|description|arguments|
|---|---|---|
|create|create a folder| `name`, `desc`|
|sort|sort a folder|`folderId`, `toInsertTo`(number)|
|list|list unorganized task||
|delete|delete the folder|`folderId`, `shouldForce`|
|list-task (list-t)|list task by folder. |`folderId`, `allOrNotDone`|
|sort-task (sort-t)|sorts tasks by folder|`taskId`, `toInsertTo` |
|move-task (move-t)|move task to a folder. specify a `falsy` value to remove it from the folder.|`taskId`, `newFolderId`|
## agenda
agenda are tasks that is associated to a person.

`gtd agenda <sub_cmd>`

|sub_cmd|description|arguments|
|---|---|---|
|create|create an agenda| `name`, `desc`|
|sort|sort agendas|`agendaId`, `toInsertTo`(number)|
|list|list unorganized task||
|list-task (list-t)|list task by agenda. |`agendaId`, `allOrNotDone`|
|sort-task (sort-t)|sorts tasks by agenda|`taskId`, `toInsertTo` |
|move-task (move-t)|move task to an agenda. specify a `falsy` value to remove it from the agenda.|`taskId`, `newAgendaId`|
## context
contexts are one of the best and helpful realization about tasks.

`gtd context <sub_cmd>`

The parameter `autoOrManual` are allowed 3 values: 
* `undefined` - resets all contexts, both automatically set and manually
* `truthy` value - resets only the automatically set context
* `falsy` value - resets only the manuallySetContext

The parameter `untilTime` must be a valid time format: 

|sub_cmd|description|arguments|
|---|---|---|
|create|create an context| `name`, `desc`|
|sort|sort contexts|`contextId`, `toInsertTo`(number)|
|list|list unorganized task||
|list-task (list-t)|list task by context. |`contextId`, `allOrNotDone`|
|sort-task (sort-t)|sorts tasks by context|`taskId`, `toInsertTo` |
|move-task (move-t)|move task to a context. specify a `falsy` value to remove it from the context.|`taskId`, `newContextId`|
|set-every|sets automatic setting of a context|`contextId`, `everyStatement`|
|reset|removes manually set contexts and sets the automated ones|`autoOrManual`|
|current|gets the current active contexts||
|set|manually set a context. |`contextId`, `untilTime?`|
|unset|unset a manually set context||
