from flask import request
import random # define the random module  
from flask_jwt_extended import (
    jwt_required,
    create_access_token,
    get_jwt_identity
)
from datetime import date
import pickle
import undetected_chromedriver as uc
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time




def login_and_get_cookies():

    email = "kevinchentestnl@gmail.com"
    password = "Suckers123@@"


    options = webdriver.ChromeOptions()
    options.add_argument(r'--user-data-dir=C:\Users\Debo\AppData\Local\Google\Chrome\User Data\Default')

    browser = uc.Chrome(options=options)
    browser.get('https://accounts.google.com/signin/v2/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&service=mail&sacu=1&rip=1&hl=en&flowName=GlifWebSignIn&flowEntry=ServiceLogin')

    wait = WebDriverWait(browser, 10)
    element = wait.until(EC.presence_of_element_located((By.ID, 'identifierId')))
    browser.find_element(By.ID, 'identifierId').send_keys(email)

    browser.find_element(By.CSS_SELECTOR, '#identifierNext > div > button > span').click()

    password_selector = "#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input"

    WebDriverWait(browser, 10).until(EC.visibility_of_element_located((By.CSS_SELECTOR, password_selector)))

    browser.find_element(By.CSS_SELECTOR, password_selector).send_keys(password)

    browser.find_element(By.CSS_SELECTOR, '#passwordNext > div > button > span').click()

    time.sleep(5)
    cookies = browser.get_cookies()
    pickle.dump(cookies, open("cookies.pkl", "wb"))
    
    browser.quit()  # Close the browser

    return jsonify({'message': 'Login successful and cookies saved'}), 200
