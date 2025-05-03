import requests
import re

def searchRedditPosts(query):
    # Define the Reddit API endpoint for searching
    url = f'https://www.reddit.com/r/anime/search.json?q={query}&restrict_sr=1&sort=relevance'
    
    # Send a GET request to Reddit API
    headers = {'User-Agent': 'python:reddit_search:v1.0 (by /u/yourusername)'}
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        
        # Extract the posts from the response data
        posts = data['data']['children']
        
        # If there are no posts, return a message
        if not posts:
            print("No posts found.")
            return
        
        # Print the details of each post
        for post in posts:
            title = post['data']['title']
            author = post['data']['author']
            url = f"https://reddit.com{post['data']['permalink']}"
            
            print(f"Title: {title}")
            print(f"Author: {author}")
            print(f"URL: {url}")
            print("-" * 80)
    else:
        print(f"Failed to fetch data: {response.status_code}")

def extract_english_title(page_title):
    # Extract the English title from the page title
    match = re.search(r"Anime (.*?) Watch Online Free", page_title)
    if match:
        return match.group(1)
    return None

def extract_japanese_title_and_episode(url):
    # Extract the Japanese title and episode number from the URL
    match = re.search(r"watch/([^/#]+)#ep=(\d+)", url)

    parts = match.group(1).split("-")
    if len(parts) > 1:
        parts.pop() 

    if match:
        japanese_title = " ".join(parts).title()  # Format the Japanese title
        episode_number = match.group(2)
        return japanese_title, episode_number
    return None, None

def search_reddit_posts(query, page_english_title, url_episode_number):
    # Define the Reddit API endpoint for searching
    url = f'https://www.reddit.com/r/anime/search.json?q={query}&restrict_sr=1&sort=relevance'
    
    # Send a GET request to Reddit API
    headers = {'User-Agent': 'python:reddit_search:v1.0 (by /u/yourusername)'}
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        
        # Extract the posts from the response data
        posts = data['data']['children']

        if not posts:
            print("No posts found.")
            return None
        
        for post in posts:
            if post['data']['author'] != "AutoLovepon":
                continue

            title = post['data']['title']
            english_title = ''
            episode_number = ''

            # if len(title.split("•")) > 1:
            dual_title_match = re.search(r'•\s*(.*?)\s*-\s*Episode', title, re.IGNORECASE)
            single_title_match = re.search(r'^(.*?)\s*-\s*Episode', title, re.IGNORECASE)

            if dual_title_match:
                english_title = dual_title_match.group(1).strip()

            elif single_title_match:
                english_title = single_title_match.group(1).strip()

            match = re.search(r'Episode\s+(\d+)\s+discussion', title, re.IGNORECASE)
            episode_number = match.group(1) if match else None

            if english_title == page_english_title and episode_number == url_episode_number:
                return(post)
    
    else:
        print(f"Failed to fetch data: {response.status_code}")
        return None

def create_comment_box(post):
    if post is None:
        print("No relevant Reddit posts found.")
        return
    
    # Display the details of each matching post
    title = post['data']['title']
    author = post['data']['author']
    url = f"https://reddit.com{post['data']['permalink']}"
    
    print(f"Title: {title}")
    print(f"Author: {author}")
    print(f"URL: {url}")
    print("-" * 80)


# page_title = "Watch Dan Da Dan Online with SUB/DUB - AnimeKAI"
# anime_url = "https://animekai.to/watch/dan-da-dan-vmly#ep=1"
page_title = "Anime Can a Boy-Girl Friendship Survive? Watch Online Free - AnimeKAI"
anime_url = "https://animekai.to/watch/danjo-no-yuujou-wa-seiritsu-suru-iya-shinai-2pxr#ep=5"


english_title = extract_english_title(page_title)
japanese_title, episode_number = extract_japanese_title_and_episode(anime_url)

query = f"{japanese_title} - Episode {episode_number} discussion"

# print(english_title)
# print(japanese_title)
# print(episode_number)
# print(query)

post = search_reddit_posts(query, english_title, episode_number)
create_comment_box(post)
