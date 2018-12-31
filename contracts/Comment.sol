pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Comment {
    struct senders {
        mapping(string => address) comment;
    }
    mapping(uint16 => senders) senderHandler;
    mapping(uint16 => string[]) textHandler;
    // mapping(uint16 => uint) latestIndex;
    uint16[] public hotels;
    // constructor(uint16[] memory Hotels) public {
    //     hotels = Hotels;
    //     for (uint i = 0; i < Hotels.length; i++) {
    //         senderHandler[hotels[i]] = senders();
    //         textHandler[hotels[i]] = new string[](1);
    //         textHandler[hotels[i]][0] = "";
    //     }
    // }
    function addComment(uint16 hotel, string memory text) public {
        if (!checkHotel(hotel) && !compareString(text, " ")) {
            senderHandler[hotel] = senders();
            textHandler[hotel] = new string[](1);
            hotels.push(hotel);
            // latestIndex[hotel] = 1;
            textHandler[hotel][0] = text;
        }
        else if (!compareString(text, " ")) {
            senderHandler[hotel].comment[text] = msg.sender;
            textHandler[hotel].push(text);
        }
    }
    function deleteComment(uint16 hotel, string memory text) public {
        require(checkHotel(hotel), "No Such Hotel");
        address sender = senderHandler[hotel].comment[text];
        require(sender == msg.sender, "Person Not Correct");
        delete senderHandler[hotel].comment[text];
        int index = getCommentIndex(hotel, text);
        if (index != -1) {
            textHandler[hotel][uint256(index)] = " ";
        }
    }
    function getAllHotelCommentCount() public view returns (uint[] memory) {
        uint[] memory counts;
        counts = new uint[](hotels.length);
        for (uint i = 0; i < hotels.length; i++) {
            counts[i] = uint256(getHotelCommentCount(hotels[i]));
        }
        return counts;
    }
    function getHotels() public view returns (uint16[] memory) {
        return hotels;
    }
    function getAllCommentsOfHotel(uint16 hotel) public view returns(string[] memory) {
        if (!checkHotel(hotel)) {
            string[] memory res = new string[](0);
            return res;
        }
        uint c = getHotelCommentCount(hotel);
        string[] memory HComments = new string[](c);
        uint t = 0;
        for (uint i = 0; i < textHandler[hotel].length; i++) {
            if (!compareString(textHandler[hotel][i], " ")) {
                HComments[t] = textHandler[hotel][i];
                t += 1;
            }
        }
        return HComments;
    }
    function getHotelCommentCount(uint16 hotel) public view returns (uint) {
        if (!checkHotel(hotel)) return 0;
        uint count = 0;
        for (uint i = 0; i < textHandler[hotel].length; i++) {
            if (!compareString(textHandler[hotel][i], " ")) count += 1;
        }
        return count;
    }
    function checkHotel(uint16 hotel) public view returns (bool) {
        for (uint i = 0; i < hotels.length; i++) {
            if (hotels[i] == hotel) return true;
        }
        return false;
    }
    function getCommentIndex(uint16 hotel, string memory text) public view returns(int) {
        uint i;
        int c;
        for (i = 0; i < textHandler[hotel].length; i++) {
            if (compareString(textHandler[hotel][i], text)) return c;
            c ++;
        }
        return -1;
    }
    function compareString(string memory a, string memory b) public pure returns(bool) {
        if (bytes(a).length == bytes(b).length) {
            uint s = bytes(a).length;
            for (uint i = 0; i < s; i++) {
                if (bytes(a)[i] != bytes(b)[i]) return false;
            }
            return true;
        }
        else return false;
    }
}