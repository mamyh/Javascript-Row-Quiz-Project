
let quizController =(function(){
    function Question(id,question,answers,correctAns){
        this.id = id;
        this.question = question;
        this.answers = answers;
        this.correctAns = correctAns;
    };
    localStorageForQuestions={
        setQuestionCollection: function(newQuestions){
            localStorage.setItem('questionCollections',JSON.stringify(newQuestions));
        },
        getQuestionCollection: function(){
            return JSON.parse(localStorage.getItem('questionCollections'));
        },
        removeQuestionCollection:function(){
            localStorage.removeItem('questionCollections');
        }
    };
    if(localStorageForQuestions.getQuestionCollection() === null){
        localStorageForQuestions.setQuestionCollection([]);
    };
    return {
        questionsFromLocalStorage: localStorageForQuestions,
        addQuestion: function(options,question){
            let questionId , newQuestion,answers=[],correctAns,isChecked=false;
            if(localStorageForQuestions.getQuestionCollection().length > 0){
                questionId = localStorageForQuestions.getQuestionCollection()[localStorageForQuestions.getQuestionCollection().length-1].id +1;
            }else{
                questionId =0;
            }
            for(let i =0 ; i < options.length;i++){
                if(options[i].value !== ""){
                    answers.push(options[i].value);
                    if(options[i].previousElementSibling.checked){
                        correctAns = options[i].value;
                        isChecked = true
                    }
                }

            }
            if(question.value !==""){
                if(answers.length > 1){
                   if(isChecked){

                       newQuestion = new Question(questionId,question.value,answers,correctAns);

                       let storagedQuestions = localStorageForQuestions.getQuestionCollection();
                       storagedQuestions.push(newQuestion);
                       localStorageForQuestions.setQuestionCollection(storagedQuestions);

                       question.value="";
                       isChecked = false;
                       for(let i=0; i<options.length;i++){
                           options[i].value='';
                       }


                   }else{
                       alert('please Select a Correct answer');
                   }
                }else{
                    alert('You must atleast two answer');
                }
            }else{
                alert('Please enter your question!');
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

    }
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
          let getId, myQuestionData,foundQuestion;
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

             updateFn(){
                let updatedInputs=[],optionElements;
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
                            storagedData.getQuestionCollection().splice(getId,1,foundQuestion);
                            storagedData.set
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

             domItems.questionUpdateBtn.onclick = updateFn;

           };
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
})(quizController,uiController);
/*Controller end*/