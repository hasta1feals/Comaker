from flask import Flask,make_response, request, jsonify
import pickle
import undetected_chromedriver as uc
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
from datetime import datetime
import sqlite3
import threading
# from db import DB
app = Flask(__name__)

# Initialize the 'browser' variable as None in the global scope
browser = None

def get_db():
    db = getattr(threading.current_thread(), 'db', None)
    if db is None:
        db = sqlite3.connect("../../database.db")
        setattr(threading.current_thread(), 'db', db)
    return db


def run_selenium_script():
    browser = uc.Chrome()
    browser.maximize_window()
    browser.get('https://accounts.google.com/signin/v2/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&service=mail&sacu=1&rip=1&hl=en&flowName=GlifWebSignIn&flowEntry=ServiceLogin')

    cookies = pickle.load(open("cookies.pkl", "rb"))

    for cookie in cookies:
        cookie['domain'] = ".google.com"
        
        try:
            browser.add_cookie(cookie)
        except Exception as e:
            print("")

    browser.get('https://mail.google.com/mail/u/0/#inbox')
    browser.get("https://la.louisvuitton.com/esp-mx/homepage")

    browser.find_element(
        By.CSS_SELECTOR, '#header > div > div > nav.lv-header__utility > ul > li.lv-header__utility-item.-search > div > button > svg').click()
    

    password_selector = "#searchHeaderInput"

    browser.find_element(
        By.CSS_SELECTOR, password_selector).send_keys("hello")
    

    conn = get_db()
    cursor = conn.cursor()


    get_query_region = "select region FROM region"
    cursor.execute(get_query_region)

    output_region = cursor.fetchall()
    region = output_region[0][0]


    browser.get(region)


    time.sleep(5)
    #dit komt alleen 1x voor dus een if else statement maken of een do while idk iets in dei kant
    browser.find_element(
        By.CSS_SELECTOR, '#lv-modal-target > div.lv-modal.-fixed.lv-localize-modal > div:nth-child(3) > div > div > button > svg').click()
    

    
    get_query_city ="select city FROM country"
    cursor.execute(get_query_city)

    
    output_city = cursor.fetchall()
    city = output_city[0][0]

    time.sleep(1)
    browser.find_element(
        By.CSS_SELECTOR, '#main > div.lv-product > div:nth-child(1) > section > div.lv-product-page-header__secondary > div > div > div.lv-product__header-buttons > div.lv-product-locate-in-store.lv-product__locate-in-store > button > span').click()

    time.sleep(1)
    search_selector = "#modalContent > div > div.lv-store-geolocation.-modal-full-size > div.lv-address-search-form > form > input"
    browser.find_element(
        By.CSS_SELECTOR, search_selector).send_keys(city)
    
   
    time.sleep(1)
    browser.find_element(
        By.CSS_SELECTOR, '#modalContent > div > div.lv-store-geolocation.-modal-full-size > div.lv-address-search-form > form > button > svg').click()
    
    time.sleep(3)

    parent_element = browser.find_element(
        By.CSS_SELECTOR, '#accordion1')
    

    div_elements = parent_element.find_elements(By.CSS_SELECTOR, 'div:nth-child(n)')

    conn = get_db()
    cursor = conn.cursor()

    get_query ="select links FROM links"
    cursor.execute(get_query)

    
    output = cursor.fetchall()
    links = [link[0] for link in output]
 
    # Define a list of links to visit
    links_to_visit =  links
    # Add more links as needed
    
    

    all_extracted_data = []  # Create a list to accumulate all data
    
    for link in links_to_visit:
    # Navigate to the current link
        browser.get(link)

    # Add the code for interacting with the page, like clicking buttons, searching, etc.
        time.sleep(1)
        browser.find_element(By.CSS_SELECTOR, '#main > div.lv-product > div:nth-child(1) > section > div.lv-product-page-header__secondary > div > div > div.lv-product__header-buttons > div.lv-product-locate-in-store.lv-product__locate-in-store > button > span').click()

        time.sleep(1)
        search_selector = "#modalContent > div > div.lv-store-geolocation.-modal-full-size > div.lv-address-search-form > form > input"
        browser.find_element(By.CSS_SELECTOR, search_selector).send_keys(city)

        time.sleep(1)
        browser.find_element(By.CSS_SELECTOR, '#modalContent > div > div.lv-store-geolocation.-modal-full-size > div.lv-address-search-form > form > button > svg').click()

        time.sleep(3)

        parent_element = browser.find_element(By.CSS_SELECTOR, '#accordion1')

       
       
        extracted_data = []
        
        div_elements = parent_element.find_elements(By.CSS_SELECTOR, 'div:nth-child(n) > button > div > h3')  

        product_title_element = browser.find_element(By.CSS_SELECTOR, '#main > div.lv-product > div:nth-child(1) > section > div.lv-product-page-header__secondary > div > div > div.lv-product__head > h1')
        product_title = product_title_element.text

        for div_element in div_elements:
        # Append the extracted data from the current iteration to the extracted_data list
            extracted_data.append(f"{product_title}: {div_element.text}")


        all_extracted_data.append(extracted_data)  # Append the extracted data from the current iteration to the all_extracted_data list
        
 


    


    return all_extracted_data

@app.route('/run-selenium-script', methods=['POST'])

def run_script_endpoint():
    data = run_selenium_script()

    data_arrays = data
 # Define the insert query, connection, and cursor outside the loop
    insert_query = "INSERT INTO Items (lv_item, lv_store, lv_stock, date_recent) VALUES (?, ?, ?,?)"
    conn = get_db()
    cursor = conn.cursor()

    for data_list in data_arrays:
        for data in data_list:
            # data = data_list[0]  # Extract the data string from the inner list

            # Split the data into its components using ': ' as the separator
            components = data.split(':')

            # Extract the first part into lv_item
            lv_item = components[0].strip()

            # Split the remaining part using ' - ' as the separator
            remaining_data = components[1].split('\n')

    
          

            # Extract the first part into lv_name
            lv_store = remaining_data[0].strip()

            # Extract the second part into lv_stock
            lv_stock =remaining_data[1].strip()

            current_date = datetime.now().strftime("%Y-%m-%d %H:%M")


            # Execute the query with the data
            cursor.execute(insert_query, (lv_item, lv_store, lv_stock, current_date))

        # Commit changes to the database
    conn.commit()

        # Close the cursor and connection
    cursor.close()
    conn.close()
    
    response = make_response(jsonify({"message": "Selenium script executed successfully", "data": data}))
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    
    return response

# Start app
if __name__ == '__main__':
    
    app.run()