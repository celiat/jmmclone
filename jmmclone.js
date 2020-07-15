const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
AWS.config.update({ region: 'us-east-1' });
const i18n = require('i18next');
const languageStrings = require('./localization');

var devoDetails;
var cleanDevoDetails;
var lastQuestionAsked;
var lastShowPlayed = 'EEL';
let skill;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {
        console.log('started LaunchIntent');

        let message;
        let reprompt;

        var DDQuestionCount = 2;

        if (DDQuestionCount > 3) {
            return DailyDevoIntentHandler.handle(handlerInput);

        } else {
            message = "Would you like to listen to today's Daily Devo?";
            reprompt = "Did you want to hear today's Daily Devo?";
            setQuestionAsked(handlerInput, 'DoYouWantDailyDevo');
            setShowPlaying(handlerInput, 'EEL');
        }

        return handlerInput.responseBuilder
            .speak(message)
            .reprompt(reprompt)
            .getResponse();
    },
};

const DailyDevoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DailyDevoIntent';
    },
    async handle(handlerInput) {
        console.log('started DDIntent');
        //var devoResult = await getDevotionalFromSitecore();
        console.log("This is devo resutl in DD after return", JSON.stringify(devoResult));

        let message;
        let reprompt;

        message = `${devoResult} ` + handlerInput.t('DD_REMINDER_QUESTION');
        setQuestionAsked(handlerInput, null);
        setQuestionAsked(handlerInput, 'DoYouWantADailyDevoReminder');
        reprompt = 'You can say, play the devo, to begin.';

        return handlerInput.responseBuilder
            .speak(message)
            .withSimpleCard('Daily Devo', message)
            .reprompt(reprompt)
            .getResponse();
    },
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log('Session ended with reason: ', JSON.stringify(handlerInput.requestEnvelope.request.reason));
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle(handlerInput) {
        return true;
    },
    handle(handlerInput, error) {
        console.log('Error handled: ' + JSON.stringify(error.message));
        // console.log('Original Request was:', JSON.stringify(handlerInput.requestEnvelope.request, null, 2));

        const speechText = 'Sorry, your skill encountered an error';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};

exports.handler = async function (event, context) {
    //console.log('REQUEST ' + JSON.stringify(event));
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addErrorHandlers(ErrorHandler)
            .addRequestHandlers(                    
            LaunchRequestHandler,
            SessionEndedRequestHandler,
            DailyDevoIntentHandler
            ).create();
    }

    const response = await skill.invoke(event, context);
    //console.log('RESPONSE :' + JSON.stringify(response));
    return response;
};
