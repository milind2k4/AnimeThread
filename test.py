import requests
import re

def extract_english_title(page_title):
    # Extract the English title from the page title
    match = re.search(r"Anime (.*?) Watch Online Free", page_title)
    if match:
        return match.group(1)
    return None

def extract_japanese_title_and_episode(url):
    # Extract the Japanese title and episode number from the URL
    match = re.search(r"watch/([^/#]+)#ep=(\d+)", url)
    if match:
        japanese_title = match.group(1).replace("-", " ").title()  # Format the Japanese title
        episode_number = match.group(2)
        return japanese_title, episode_number
    return None, None

def search_reddit_posts(query, url_episode_number):
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
            return []
        
        # Filter posts to match the correct anime and episode
        matching_posts = []
        for post in posts:
            title = post['data']['title']
            match = re.match(r"(.*?) • (.*?) - Episode (\d+) discussion", title)
            if match:
                japanese_title = match.group(1)
                english_title = match.group(2)
                episode_number = match.group(3)
                
                # Here we check if the English title matches and the episode number matches
                if english_title.lower() == query.split("episode")[0].strip().lower() and episode_number == url_episode_number:
                    matching_posts.append(post)

        return matching_posts
    
    else:
        print(f"Failed to fetch data: {response.status_code}")
        return []

def create_comment_box(posts):
    if not posts:
        print("No relevant Reddit posts found.")
        return
    
    # Display the details of each matching post
    for post in posts:
        title = post['data']['title']
        author = post['data']['author']
        url = f"https://reddit.com{post['data']['permalink']}"
        comments_count = post['data']['num_comments']
        created_utc = post['data']['created_utc']
        
        # Convert the timestamp to a human-readable date
        from datetime import datetime
        created_date = datetime.fromtimestamp(created_utc).strftime('%Y-%m-%d %H:%M:%S')
        
        print(f"Title: {title}")
        print(f"Author: {author}")
        print(f"URL: {url}")
        print(f"Comments: {comments_count}")
        print(f"Created on: {created_date}")
        print("-" * 80)

# Example of calling the functions with test data
page_title = "Anime Danjo no Yuujou wa Seiritsu Suru Iya Shinai Watch Online Free - AnimeKAI"
anime_url = "https://animekai.to/watch/danjo-no-yuujou-wa-seiritsu-suru-iya-shinai-2pxr#ep=5"

# Extract titles and episode numbers
english_title = extract_english_title(page_title)
japanese_title, episode_number = extract_japanese_title_and_episode(anime_url)

# Prepare query and search Reddit
query = f"{english_title} episode {episode_number}"
posts = search_reddit_posts(query, episode_number)

# Print the matching Reddit posts
create_comment_box(posts)
