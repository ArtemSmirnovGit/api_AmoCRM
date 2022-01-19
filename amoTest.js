const tokenHeaders = new Headers();
const formdata = new FormData();

const userId = 'https://freestylehh4.amocrm.ru' // логин пользователя в портале AmoCRM
formdata.append("client_id", "fc366590-dff2-45b6-a71c-ebd6715d31d0");
formdata.append("client_secret", "uBeUx8vp9oJhEpTVe8tPgrUPqWh6sYeQW92tRUOFf8Wopr3NBby7XRZIfQ6W9mkm");
formdata.append("grant_type", "authorization_code");
formdata.append("code", "def50200a64dc41f4edb6818ce893f5528326459402a7fa4ca929a110a6293d913c14a67fd513264abe60c87acdc812939282c79d76cb2cc8d285a5de088be5e567545e163657cb642972558096dd89b7c4c4816e79a294fca3f87d962de88ae378cc5d7f599d7ef52b6f1f3bb0bf435b03c3b217c598b7a01f70f9fb3dcefd9b36218f4165e6642346facebeca2a6d10a88ae7f0b4b91c5a926b8293cd57ae6530e2e997ef533850cc1d7ef5e1aee4a8d452b7a101e8e9bae93d30c5dacf9ed329fb6bd61edde39874a6e2dd81962209b62ca75859dcde35e0d701db103722e8f4a146534c38cadad25389fb805aac5cab84b0e5a30b280a62703c857dc19b9113eeafa62bbab79fc772226d1158d854c087a6be55d70753de72f431d0040b80e920c200cbfa296bc7b81e2f35b8711b11ba36505468a981fa584a1ccc2af85c0b0feccea4a0549d495c7dd9e5ba3aded81f0c1b7085e1b16644c0eb4adbe7493b9bda9ce4c6c083070f3f0f5c59e36a6b8f15caa0d6c3a5bf10794adbaedb1500b1b59ab9e1de1d53b0341c7d9050e198ade987d636a40b5c8537d761fd4858b69bb035f902709916e1f9f556c36b93e4c22234fc26cbc0ff49a43c3");
formdata.append("redirect_uri", "https://example.com");

let arrayForTasksReq = []

const requestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
};

function setReqForTasks(param) { // Формирование тела POST запроса для создания задач
    let ptrn = {
        "created_by": 7817095,
        "task_type_id": 1,
        "complete_till": 1642625940,
        "text": "Контакт без сделок",
        "entity_id": param,
        "entity_type": "contacts"
    }
    arrayForTasksReq.push(ptrn)
}


async function getAuth() { //Получение Access_token и формирование параметров для последующих запросов к AmoCRM
    try {
        let response = await fetch(userId + "/oauth2/access_token", requestOptions);
        if (response.status>200) {
            alert("Что-то пошло не так с аутентификацией \n"  + "Код ошибки - " + response.status);
        }
        else {
            let data = await response.json();
            const {access_token} = data
            const {token_type} = data
            const param = token_type + ' ' +  access_token
            tokenHeaders.append('Authorization', param)
        }
    } catch (error) {
        alert("Что-то пошло не так с аутентификацией");
    }
}


async function getLeads() { // GET запрос для получения информации и контактах
    try {
        let response = await fetch(userId + "/api/v4/contacts?with=leads",
            {
                method: 'GET',
                headers: tokenHeaders,
                redirect: 'follow'
            });
        if (response.status>200) {
            alert("Что-то пошло не так с получением сделок контактов \n"  + "Код ошибки - " + response.status);
        }
        else {
            let data = await response.json()
            return data
        }

    } catch (error) {
        alert("Что-то пошло не так с получением сделок контактов");
    }
}


async function getTasks(raw) {  // POST запрос для создания задач
    try {
        let response = await fetch(userId + "/api/v4/tasks",
            {
                method: 'POST',
                headers: tokenHeaders,
                body: raw,
                redirect: 'follow'
            });
        if (response.status>200) {
            alert("Что-то пошло не так с созданием задач \n"  + "Код ошибки - " + response.status);
        }
        else {
            let data = await response.json()
            return data
        }
    } catch (error) {
        alert("Что-то пошло не так с созданием задач");
    }
}


async function result() {
    try {
        await getAuth()
        const res = await getLeads()

            const {_embedded} = res
            const {contacts} = _embedded
            const leads_filtered = contacts.filter(el => el._embedded.leads.length === 0) // Находим все контакты у которых нет сделок
            if (leads_filtered.length===0) {
                console.log("Контактов без сделок не обнаружено")
            }
            else {
                leads_filtered.map(el => setReqForTasks(el.id)) // Вычисляем все id контактов без сделок и формируем тело для POST запроса
                let raw = JSON.stringify(arrayForTasksReq) // Преобразуем тело для POST запроса в JSON формат
                await getTasks(raw) // Выполняем POST запрос для создания задач
                console.log(raw)
            }

    } catch (error) {
        alert(error);
    }
}

result()