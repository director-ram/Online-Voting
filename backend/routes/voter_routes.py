from flask import Blueprint, request, jsonify
from models.vote_model import Vote
from models.candidate_model import Candidate
from .auth_routes import token_required
from datetime import datetime, timedelta, timezone

voter_bp = Blueprint('voters', __name__)

# IST timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_time():
    """Get current time in IST (Indian Standard Time)"""
    return datetime.now(IST)

def is_voting_open():
    """Check if voting is currently allowed (8 AM to 8 PM IST)"""
    now = get_ist_time()
    current_hour = now.hour
    # Voting allowed between 8 AM (08:00) and 8 PM (20:00)
    return 8 <= current_hour < 20

@voter_bp.route('/vote', methods=['POST'])
@token_required
def cast_vote(current_user):
    """Cast a vote for a candidate"""
    try:
        # Check if voting is open
        if not is_voting_open():
            now = get_ist_time()
            current_time = now.strftime('%I:%M %p')
            return jsonify({
                'error': f'Voting is closed. Voting hours are 8:00 AM to 8:00 PM IST. Current time: {current_time}'
            }), 403
        
        # Extract user ID from dict or tuple
        if isinstance(current_user, dict):
            voter_id = current_user.get('id')
        elif isinstance(current_user, (list, tuple)):
            voter_id = current_user[0] if len(current_user) > 0 else None
        else:
            voter_id = None
            
        if not voter_id:
            return jsonify({'error': 'Unable to resolve current user'}), 401
        
        data = request.get_json()
        candidate_id = data.get('candidate_id')
        
        if not candidate_id:
            return jsonify({'error': 'Candidate ID is required'}), 400
        
        # Check if user has already voted
        has_voted = Vote.has_voted(voter_id)
        if has_voted:
            return jsonify({'error': 'You have already voted'}), 400
        
        # Check if candidate exists and is active
        candidate = Candidate.get_by_id(candidate_id)
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404
        
        # Cast vote
        vote_id = Vote.cast_vote(voter_id, candidate_id)
        
        if vote_id is None:
            return jsonify({'error': 'Failed to cast vote'}), 500
        
        return jsonify({
            'message': 'Vote cast successfully',
            'vote_id': vote_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@voter_bp.route('/status', methods=['GET'])
@token_required
def get_voter_status(current_user):
    """Check if the user has voted"""
    try:
        # Extract user ID from dict or tuple
        if isinstance(current_user, dict):
            voter_id = current_user.get('id')
        elif isinstance(current_user, (list, tuple)):
            voter_id = current_user[0] if len(current_user) > 0 else None
        else:
            voter_id = None
            
        if not voter_id:
            return jsonify({'error': 'Unable to resolve current user'}), 401
        
        has_voted = Vote.has_voted_today(voter_id)
        
        return jsonify({
            'has_voted': has_voted,
            'voter_id': voter_id,
            'message': 'Checked voting status for today'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@voter_bp.route('/my-vote', methods=['GET'])
@token_required
def get_my_vote(current_user):
    """Get the candidate the user voted for (if any)"""
    try:
        # Extract user ID from dict or tuple
        if isinstance(current_user, dict):
            voter_id = current_user.get('id')
        elif isinstance(current_user, (list, tuple)):
            voter_id = current_user[0] if len(current_user) > 0 else None
        else:
            voter_id = None
            
        if not voter_id:
            return jsonify({'error': 'Unable to resolve current user'}), 401
        
        # Use the correct method name: get_user_vote instead of get_vote_by_voter
        vote = Vote.get_user_vote(voter_id)
        
        if not vote:
            return jsonify({
                'has_voted': False,
                'candidate': None
            }), 200
        
        # Get candidate details
        if isinstance(vote, tuple):
            candidate_id = vote[2] if len(vote) > 2 else None  # candidate_id is third field
        elif isinstance(vote, dict):
            candidate_id = vote.get('candidate_id')
        else:
            candidate_id = None
        
        if candidate_id:
            candidate = Candidate.get_by_id(candidate_id)
            
            if isinstance(candidate, tuple):
                candidate_data = {
                    'id': candidate[0],
                    'name': candidate[1],
                    'party': candidate[2],
                    'position': candidate[3] if len(candidate) > 3 else None
                }
            elif isinstance(candidate, dict):
                candidate_data = candidate
            else:
                candidate_data = None
        else:
            candidate_data = None
        
        return jsonify({
            'has_voted': True,
            'candidate': candidate_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@voter_bp.route('/voting-status', methods=['GET'])
def get_voting_status():
    """Get current voting status (open/closed) and time information"""
    now = get_ist_time()
    current_hour = now.hour
    current_time = now.strftime('%I:%M %p IST')
    is_open = is_voting_open()
    
    # Calculate time remaining or time until opening
    if is_open:
        # Calculate time until closing (8 PM)
        hours_until_close = 20 - current_hour
        if hours_until_close == 1:
            time_remaining = "1 hour"
        else:
            time_remaining = f"{hours_until_close} hours"
        message = f"Voting is open until 8:00 PM. Time remaining: {time_remaining}. Results reset daily."
    elif current_hour < 8:
        # Before opening
        hours_until_open = 8 - current_hour
        if hours_until_open == 1:
            time_until = "1 hour"
        else:
            time_until = f"{hours_until_open} hours"
        message = f"Voting opens at 8:00 AM. Opens in: {time_until}. New voting period for today!"
    else:
        # After closing (8 PM or later)
        message = "Voting has closed for today. Results are final. Come back tomorrow to vote again!"
    
    return jsonify({
        'is_open': is_open,
        'current_time': current_time,
        'voting_hours': '8:00 AM - 8:00 PM IST',
        'message': message,
        'opens_at': '8:00 AM IST',
        'closes_at': '8:00 PM IST'
    }), 200
