let quizController;
quizController = (function () {
    function Question(id, question, answers, correctAns) {
        this.id = id;
        this.question = question;
        this.answers = answers;
        this.correctAns = correctAns;
    };
    let localStorageForQuestions = {
        setQuestionCollection: function (newQuestions) {
            localStorage.setItem('questionCollections', JSON.stringify(newQuestions));
        },
        getQuestionCollection: function () {
            return JSON.parse(localStorage.getItem('questionCollections'));
        },
        removeQuestionCollection: function () {
            localStorage.removeItem('questionCollections');
        }
    };

    let quizIndex = {
        index:0,
    }

    if (localStorageForQuestions.getQuestionCollection() === null) {
        localStorageForQuestions.setQuestionCollection([]);
    }
    ;

    return {
        questionsFromLocalStorage: localStorageForQuestions,
        getQuizIndex: quizIndex,
        addQuestion: function (options, question) {
            let questionId, newQuestion, answers = [], correctAns, isChecked = false;
            if (localStorageForQuestions.getQuestionCollection().length > 0) {
                questionId = localStorageForQuestions.getQuestionCollection()[localStorageForQuestions.getQuestionCollection().length - 1].id + 1;
            } else {
                questionId = 0;
            }
            for (let i = 0; i < options.length; i++) {
                if (options[i].value !== "") {
                    answers.push(options[i].value);
                    if (options[i].previousElementSibling.checked) {
                        correctAns = options[i].value;
                        isChecked = true
                    }
                }

            }
            if (question.value !== "") {
                if (answers.length > 1) {
                    if (isChecked) {

                        newQuestion = new Question(questionId, question.value, answers, correctAns);

                        let storagedQuestions = localStorageForQuestions.getQuestionCollection();
                        storagedQuestions.push(newQuestion);
                        localStorageForQuestions.setQuestionCollection(storagedQuestions);

                        question.value = "";
                        isChecked = false;
                        for (let i = 0; i < options.length; i++) {
                            options[i].value = '';
                        }


                    } else {
                        alert('please Select a Correct answer');
                    }
                } else {
                    alert('You must atleast two answer');
                }
            } else {
                alert('Please enter your question!');
            }
        },
        correctAnswer:function(answerDom){
           if(localStorageForQuestions.getQuestionCollection()[quizIndex.index].correctAns === answerDom.textContent){
               return true;
           } else{
               return false;
           }
        },
    };
})();

/*UIController start*/
let uiController =(function(){
    domItems ={
        /*admin panel*/
        adminOptionsContainer    :document.querySelector('.admin-options-container'),
        adminOptions             :document.querySelectorAll('.admin-option'),
        newQuestionText          :document.getElementById('new-question-text'),
        questionInsertBtn        : document.getElementById('question-insert-btn'),
        insertedQuestionsWrapper : document.querySelector('.inserted-questions-wrapper'),
        questionUpdateBtn        :document.getElementById('question-update-btn'),
        questionDeleteBtn        :document.getElementById('question-delete-btn'),
        questionClearBtn         :document.getElementById('questions-clear-btn'),

        /*quiz section start*/
        askedQuestionText        :document.getElementById('asked-question-text'),
        instantAnswerContainer   :document.querySelector('.instant-answer-container'),
        quizOptionsWrapper       :document.querySelector('.quiz-options-wrapper'),
        progress                 :document.querySelector('progress'),
        progressPara             :document.getElementById('progress'),

    };

    return  {
      getDomItems: domItems,

      addInputDinamically:function(){
         let addInput = function(){

             let inputHtml,z;
             z = document.querySelectorAll('.admin-option').length;
             inputHtml =`<div class="admin-option-wrapper">
                            <input type="radio" class="admin-option-${z}" name="answer" value="${z}">
                            <input type="text" class="admin-option admin-option-${z}" value="">
                        </div>`;
             domItems.adminOptionsContainer.insertAdjacentHTML('beforeend',inputHtml);
             domItems.adminOptionsContainer.lastElementChild.previousElementSibling.lastElementChild.removeEventListener('focus',addInput);
             domItems.adminOptionsContainer.lastElementChild.lastElementChild.addEventListener('focus',addInput);
                    
         }
         domItems.adminOptionsContainer.lastElementChild.lastElementChild.addEventListener('focus',addInput);

      },

      showQuestions: function(storagedQuestions){
          let innerHtml;

          domItems.insertedQuestionsWrapper.innerHTML ='';

          for (let i =0;i < storagedQuestions.getQuestionCollection().length;i++){
              innerHtml =`<p><span>${i+1}. ${storagedQuestions.getQuestionCollection()[i].question}</span><button id="question-${storagedQuestions.getQuestionCollection()[i].id}">Edit</button></p>`
              domItems.insertedQuestionsWrapper.insertAdjacentHTML('afterbegin',innerHtml);
          }
      },
      editQuestions:function(event,storagedData){
          let getId, myQuestionData,foundQuestion,self = this;
           if('question-'.indexOf(event.target.id)){
              domItems.questionUpdateBtn.style.visibility ='visible';
              domItems.questionDeleteBtn.style.visibility ='visible';
              domItems.questionInsertBtn.style.visibility ='hidden';
              domItems.questionClearBtn.style.pointerEvents ='none';

              getId=parseInt(event.target.id.split('-')[1]);
              foundQuestion = storagedData.getQuestionCollection()[getId];

             domItems.adminOptionsContainer.innerHTML ='';
             for(let i =0 ; i < foundQuestion.answers.length; i++){
                let innerHtml =`<div class="admin-option-wrapper">
                                      <input type="radio" class="admin-option-${i}" name="answer" value="${i}">
                                      <input type="text" class="admin-option admin-option-${i}" value="${foundQuestion.answers[i]}">
                                  </div>`;
                domItems.adminOptionsContainer.insertAdjacentHTML('beforeend',innerHtml);

             }
             domItems.newQuestionText.value=foundQuestion.question;
             this.addInputDinamically();

             function backToDefault(){
                 let options = document.querySelectorAll('.admin-option');
                 domItems.questionUpdateBtn.style.visibility="hidden";
                 domItems.questionDeleteBtn.style.visibility="hidden";
                 domItems.questionInsertBtn.style.visibility="visible";
                 domItems.questionClearBtn.style.pointerEvents="";

                 domItems.newQuestionText.value="";

                 for(let i=0;i < options.length;i++){
                     options[i].value ="";
                     if(options[i].previousElementSibling.checked){
                         options[i].previousElementSibling.checked =false;
                     }
                 }
                 self.showQuestions(storagedData);
             }

             function updateFn(){

                let updatedInputs=[],optionElements,questions;
                questions =storagedData.getQuestionCollection();
                optionElements = document.querySelectorAll('.admin-option');
                foundQuestion.question= domItems.newQuestionText.value;
                foundQuestion.correctAns ='';
                for(let i =0 ; i < optionElements.length; i++){
                    if(optionElements[i].value!==""){
                        updatedInputs.push(optionElements[i].value);
                        if(optionElements[i].previousElementSibling.checked){
                            foundQuestion.correctAns = optionElements[i].value;
                        }
                    }

                }

                if(foundQuestion.question !==""){
                    if(updatedInputs.length > 1){
                        if(foundQuestion.correctAns !==""){
                            foundQuestion.answers= updatedInputs;

                            questions.splice(getId,1,foundQuestion);

                            storagedData.setQuestionCollection(questions);

                            backToDefault();
                        }else{
                            alert('you must chose correct Answer');
                        }
                    }else{
                        alert('you must enter at least 2 input');
                    }
                }else{
                    alert('Your Question can not be empty');
                }
               }
               function deleteFn(){

                  let questions =storagedData.getQuestionCollection();
                  questions.splice(getId,1);
                  storagedData.setQuestionCollection(questions);
                  backToDefault();

               }

             domItems.questionUpdateBtn.onclick = updateFn;
             domItems.questionDeleteBtn.onclick = deleteFn;

           };
      },
      showQuizDinamically: function(storagedData,quizIndex){
          let quizData,innerHtml,characters;
          characters=['A','B','C','D','E','F'];
          quizData = storagedData.getQuestionCollection()[quizIndex.index];
          domItems.askedQuestionText.textContent = quizData.question;
          domItems.quizOptionsWrapper.innerHTML="";
          for(let  i =0; i < quizData.answers.length; i++){
              innerHtml =`<div class="choice-${i}"><span class="choice-${i}">${characters[i]}</span><p  class="choice-${i}">${quizData.answers[i]}</p></div>`;
              domItems.quizOptionsWrapper.insertAdjacentHTML('beforeend',innerHtml);
          }
      },
      displayProgressBAr : function(storaged,quizIndex){
                 domItems.progress.max=storaged.getQuestionCollection().length;
                 domItems.progress.value = quizIndex.index +1;

                 domItems.progressPara.textContent = (quizIndex.index+1)+'/'+storaged.getQuestionCollection().length;
          },
    };
})();
/*UIController ends*/
/*Controller start*/
let controller =(function(quizCtrl,UICtrl){
  let selectedDomItems = UICtrl.getDomItems;
  UICtrl.addInputDinamically();
  selectedDomItems.questionInsertBtn.addEventListener('click',function(){
      let adminOptions = document.querySelectorAll('.admin-option');
      let question     =selectedDomItems.newQuestionText;
      quizCtrl.addQuestion(adminOptions,question);
      UICtrl.showQuestions(quizCtrl.questionsFromLocalStorage);

  });
  UICtrl.showQuestions(quizCtrl.questionsFromLocalStorage);
   selectedDomItems.insertedQuestionsWrapper.addEventListener('click',function(e){
       UICtrl.editQuestions(e,quizCtrl.questionsFromLocalStorage);
   });
   /*quiz section*/
    UICtrl.showQuizDinamically(quizCtrl.questionsFromLocalStorage,quizCtrl.getQuizIndex);
    UICtrl.displayProgressBAr(quizCtrl.questionsFromLocalStorage,quizCtrl.getQuizIndex);
    selectedDomItems.quizOptionsWrapper.addEventListener('click',function(e){
        let divs,answer;
        divs = document.querySelectorAll('.quiz-options-wrapper div');
        for(let i =0;i < divs.length;i++){
            if(e.target.className === 'choice-'+i){
               answer = document.querySelector('.quiz-options-wrapper div p.'+e.target.className);
               console.log(quizCtrl.correctAnswer(answer));
            }
        }
    });
})(quizController,uiController);
/*Controller end*/