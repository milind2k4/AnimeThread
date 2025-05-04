import requests
import re

def extract_japanese_title_and_episode(url):
    # Extract the Japanese title and episode number from the URL
    match = re.search(r"watch/([^/#]+)#ep=(\d+)", url)

    parts = match.group(1).split("-")
    if len(parts) > 1:
        parts.pop() 

    if match:
        page_japanese = " ".join(parts).title()  # Format the Japanese title
        episode_number = match.group(2)
        return page_japanese, episode_number
    return None, None


def normalize_title(title):
    return re.sub(r'[^\w\s]', '', title.lower()).strip()

def search_reddit_posts(query, page_japanese, page_english, url_episode_number):
    url = f'https://www.reddit.com/r/anime/search.json?q={requests.utils.quote(query)}&restrict_sr=1&sort=relevance'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    }

    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        posts = data['data']['children']

        if not posts:
            print("No posts found.")
            return None
        
        for post in posts:
            post_data = post['data']
            if post_data['author'] != "AutoLovepon":
                continue

            title = post_data['title']
            post_english = ''
            post_japanese = ''
            episode_number = ''
            dual_title_match = re.search(r'^(.*?)\s*•\s*(.*?)\s*-\s*Episode', title, re.IGNORECASE)
            single_title_match = re.search(r'^(.*?)\s*-\s*Episode', title, re.IGNORECASE)

            if dual_title_match:
                post_japanese = dual_title_match.group(1).strip()
                post_english = dual_title_match.group(2).strip()
                # print(f"{post_japanese} - {post_english}")

            elif single_title_match:
                post_english = post_japanese = single_title_match.group(1).strip()
                # print(english_title)

            match = re.search(r'Episode\s+(\d+)\s+discussion', title, re.IGNORECASE)
            episode_number = match.group(1) if match else None

            # Match either English or Japanese title
            title_matches = (
                normalize_title(post_english) in normalize_title(page_english) or 
                normalize_title(post_english) in normalize_title(page_japanese) or
                normalize_title(post_japanese) in normalize_title(page_english) or
                normalize_title(post_japanese) in normalize_title(page_japanese)
            )

            if title_matches and episode_number == url_episode_number:
                return post
    
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
anime_url = "https://animekai.to/watch/shoshimin-how-to-become-ordinary-season-2-55x5#ep=4"


page_english = "Shoshimin: How to Become Ordinary Season 2"
page_japanese = "Shoushimin Series 2nd Season"
episode_number = "4"

query = f"{page_english} - Episode {episode_number} discussion"
print(query)
print()
# print(english_title)
# print(japanese_title)
# print(episode_number)
# print(query)

post = search_reddit_posts(query, page_japanese, page_english, episode_number)
create_comment_box(post)
